import { sql } from '../connection.js';

export interface PlatformMetrics {
    gmvToday: number;
    gmvMonth: number;
    totalOrders: number;
    totalConversations: number;
    ordersFromConversations: number;
    conversionRate: number;
    topRestaurants: Array<{
        tenantId: string;
        name: string;
        gmv: number;
        orderCount: number;
    }>;
    disconnectedCount: number;
    aiFailureRate: number;
    avgResponseTimeSec: number;
    totalTenants: number;
    totalCustomers: number;
}

export async function getGMV(period: 'today' | 'month'): Promise<number> {
    const dateFilter =
        period === 'today'
            ? sql`created_at >= current_date`
            : sql`created_at >= date_trunc('month', current_date)`;

    const rows = await sql<{ total: string }[]>`
        select coalesce(sum(total), 0)::text as total
        from orders
        where status != 'cancelado'
          and ${dateFilter}
    `;
    return Number(rows[0].total);
}

export async function getConversionRate(): Promise<{
    totalConversations: number;
    ordersFromConversations: number;
    rate: number;
}> {
    const rows = await sql<
        { totalConv: string; withOrder: string }[]
    >`
        select
            (select count(distinct session_id) from chats where role = 'user')::text as "totalConv",
            (select count(distinct c.session_id)
             from chats c
             join customers cu on cu.phone = c.session_id
             join orders o on o.customer_id = cu.id
            )::text as "withOrder"
    `;
    const totalConv = Number(rows[0].totalConv);
    const withOrder = Number(rows[0].withOrder);
    return {
        totalConversations: totalConv,
        ordersFromConversations: withOrder,
        rate: totalConv > 0 ? (withOrder / totalConv) * 100 : 0,
    };
}

export async function getTopRestaurants(
    limit = 5
): Promise<
    Array<{ tenantId: string; name: string; gmv: number; orderCount: number }>
> {
    const rows = await sql<
        { tenantId: string; name: string; gmv: string; orderCount: string }[]
    >`
        select
            t.id as "tenantId",
            t.name,
            coalesce(sum(o.total), 0)::text as gmv,
            count(o.id)::text as "orderCount"
        from tenants t
        left join orders o on o.tenant_id = t.id and o.status != 'cancelado'
        group by t.id, t.name
        order by gmv desc
        limit ${limit}
    `;
    return rows.map((r) => ({
        tenantId: r.tenantId,
        name: r.name,
        gmv: Number(r.gmv),
        orderCount: Number(r.orderCount),
    }));
}

export async function getAIFailureRate(): Promise<number> {
    const rows = await sql<{ rate: string }[]>`
        select
            case
                when count(*) = 0 then 0
                else (count(*) filter (where message->>'type' = 'tool_result' and message->>'error' is not null) * 100.0 / count(*))
            end::text as rate
        from chats
        where role = 'assistant'
           or message->>'type' = 'tool_result'
    `;
    return Number(rows[0].rate);
}

export async function getAvgResponseTimeSec(): Promise<number> {
    const rows = await sql<{ avg_sec: string }[]>`
        select coalesce(
            avg(extract(epoch from (a.created_at - u.created_at))),
            0
        )::text as avg_sec
        from chats u
        join lateral (
            select created_at
            from chats
            where session_id = u.session_id
              and role = 'assistant'
              and created_at > u.created_at
            order by created_at
            limit 1
        ) a on true
        where u.role = 'user'
    `;
    return Number(rows[0].avg_sec);
}

export async function getCounts(): Promise<{
    totalTenants: number;
    totalCustomers: number;
    totalOrders: number;
}> {
    const rows = await sql<
        { tenants: string; customers: string; orders: string }[]
    >`
        select
            (select count(*) from tenants)::text as tenants,
            (select count(*) from customers)::text as customers,
            (select count(*) from orders)::text as orders
    `;
    return {
        totalTenants: Number(rows[0].tenants),
        totalCustomers: Number(rows[0].customers),
        totalOrders: Number(rows[0].orders),
    };
}

export async function getPlatformMetrics(): Promise<PlatformMetrics> {
    const [gmvToday, gmvMonth, conversion, top, failureRate, avgTime, counts] =
        await Promise.all([
            getGMV('today'),
            getGMV('month'),
            getConversionRate(),
            getTopRestaurants(5),
            getAIFailureRate(),
            getAvgResponseTimeSec(),
            getCounts(),
        ]);

    return {
        gmvToday,
        gmvMonth,
        totalOrders: counts.totalOrders,
        totalConversations: conversion.totalConversations,
        ordersFromConversations: conversion.ordersFromConversations,
        conversionRate: conversion.rate,
        topRestaurants: top,
        disconnectedCount: 0, // filled by Evolution API check at the route level
        aiFailureRate: failureRate,
        avgResponseTimeSec: avgTime,
        totalTenants: counts.totalTenants,
        totalCustomers: counts.totalCustomers,
    };
}
