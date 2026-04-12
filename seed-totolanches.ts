import postgres from 'postgres';
import path from 'path';

const sql = postgres(process.env.DATABASE_URL!);

const categories = [
  "Lanches Tradicionais",
  "Lanches Artesanais",
  "Combos de Lanches",
  "Pizzas",
  "Porções",
  "Bebidas",
  "Doces Caseiros"
];

const products = [
  // Lanches Tradicionais
  { cat: "Lanches Tradicionais", name: "Lanche Kids + Fritas", desc: "Pão de batata, alface, tomate, mini bife caseiro e queijo. Acompanha fritas.", price: 15.00, img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80" },
  { cat: "Lanches Tradicionais", name: "🍔 Lanches Bovinos (Caseiro)", desc: "Desde a escolha do pão, da carne, até o molho: 35 anos de tradição. Escolha o seu lanche!", price: 12.00, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
  { cat: "Lanches Tradicionais", name: "🍔 Lanches de Frango Desfiado", desc: "Tradição na chapa. Acompanha catchup + 1 sachê de maionese especial!", price: 12.00, img: "https://images.unsplash.com/photo-1615719413546-198b25453f85?w=500&q=80" },
  { cat: "Lanches Tradicionais", name: "🥪 Misto Quente", desc: "O típico e delicioso sanduíche preparado na chapa, pão crocante e recheio cremoso.", price: 12.00, img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80" },
  
  // Lanches Artesanais
  { cat: "Lanches Artesanais", name: "🍔 Gourmets | Artesanais", desc: "Nossa linha Gourmet é a combinação dos mais requintados ingredientes, elaborados artesanalmente com a nossa tradição em hamburgueria!", price: 35.00, img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&q=80" },

  // Combos
  { cat: "Combos de Lanches", name: "Combo Totó 1: Hamburguer + Fritas", desc: "Hambúrguer: Pão, bife, tomate, alface, batata palha e milho. Acompanha fritas da casa.", price: 18.00, img: "https://images.unsplash.com/photo-1594212691516-7463f1092fb1?w=500&q=80" },

  // Pizzas
  { cat: "Pizzas", name: "🍕 Pizza Pequena", desc: "Tamanho - 25 cm diâmetro/04 fatias. Recheada generosamente com produtos selecionados!", price: 30.00, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
  { cat: "Pizzas", name: "🍕 Pizza Média - 01 Sabor", desc: "Tamanho - 30 cm diâmetro/08 fatias. Acompanha catchup + maionese especial.", price: 38.00, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80" },
  { cat: "Pizzas", name: "🍕 Pizza Grande - Meio a Meio", desc: "Tamanho - 35 cm diâmetro/08 fatias. Escolha 2 sabores preferidos!", price: 40.00, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80" },

  // Porções
  { cat: "Porções", name: "🍟 Porções de Batata Frita", desc: "Perfeitas para acompanhar aquela cervejinha gelada ou reunir a família.", price: 20.00, img: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80" },
  { cat: "Porções", name: "Trio Mineiro", desc: "Mandioca, torresmo e linguiça caseira.", price: 60.00, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80" },

  // Bebidas
  { cat: "Bebidas", name: "Refrigerantes Lata (350 ml)", desc: "Um refri geladinho é tudo de bom!", price: 6.00, img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80" },
  { cat: "Bebidas", name: "Suco Natural - Laranja", desc: "Excelente pedida para se deliciar com o gostinho da fruta.", price: 10.00, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80" },

  // Doces Caseiros
  { cat: "Doces Caseiros", name: "🧁 Brigadeiro Caseiro", desc: "Clássico brigadeiro de festa.", price: 4.00, img: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&q=80" },
  { cat: "Doces Caseiros", name: "🧁 Brownie Caseiro", desc: "Brownie molhadinho de chocolate.", price: 10.00, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
];

async function seed() {
  try {
    console.log("Iniciando rotina de clonagem do cardápio Totolanches...");
    
    // Obter o tenant de teste atual
    const tenants = await sql`SELECT id FROM tenants ORDER BY created_at DESC LIMIT 1`;
    if (tenants.length === 0) {
       console.log("Nenhum restaurante encontrado. Crie um no onboarding antes.");
       return;
    }
    const tenantId = tenants[0].id;
    console.log("Tenant selecionado:", tenantId);

    // Limpar cardápio fake que estava lá
    console.log("Limpando cardápio atual...");
    await sql`DELETE FROM products WHERE tenant_id = ${tenantId}`;
    await sql`DELETE FROM categories WHERE tenant_id = ${tenantId}`;

    // Inserir categorias
    console.log("Inserindo Categorias...");
    const catMap = new Map();
    for (const c of categories) {
      const result = await sql`
        INSERT INTO categories (tenant_id, name)
        VALUES (${tenantId}, ${c})
        RETURNING id
      `;
      catMap.set(c, result[0].id);
    }

    // Inserir produtos
    console.log("Inserindo Produtos...");
    for (const p of products) {
      const categoryId = catMap.get(p.cat);
      if (categoryId) {
         await sql`
            INSERT INTO products (tenant_id, category_id, name, description, price, available, menu_type, image_url)
            VALUES (${tenantId}, ${categoryId}, ${p.name}, ${p.desc}, ${p.price}, true, 'fixed', ${p.img})
         `;
      }
    }

    console.log("Cardápio populado com sucesso! Acesse a interface e veja as fotos premium e itens idênticos ao do Totolanches.");
  } catch (err) {
    console.error("Erro no Seed:", err);
  }
}

seed();
