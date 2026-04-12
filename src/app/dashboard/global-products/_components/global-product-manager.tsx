'use client';

import { useState, useEffect, useRef } from 'react';

type GlobalProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
};

const CATEGORIES = [
  'Hamburgueria',
  'Pizzaria',
  'Marmita',
  'Acai',
  'Sushi',
  'Padaria',
  'Bebidas',
  'Sobremesas',
  'Outro',
];

export function GlobalProductManager() {
  const [products, setProducts] = useState<GlobalProduct[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Hamburgueria');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/global-products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      });
  }, []);

  const filtered =
    filter === 'Todos'
      ? products
      : products.filter(p => p.category.toLowerCase() === filter.toLowerCase());

  const openCreateModal = () => {
    setEditingId(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('Hamburgueria');
    setFormImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: GlobalProduct) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormDesc(p.description ?? '');
    setFormCategory(p.category);
    setFormImage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategory) return;
    setSaving(true);

    let imageUrl: string | null = null;
    if (formImage) {
      const fd = new FormData();
      fd.append('file', formImage);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (upData.url) imageUrl = upData.url;
    }

    const body: Record<string, unknown> = {
      name: formName,
      description: formDesc || null,
      category: formCategory,
    };
    if (imageUrl) body.imageUrl = imageUrl;

    if (editingId) {
      // Update
      const res = await fetch(`/api/global-products/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.product) {
        setProducts(prev =>
          prev.map(p => (p.id === editingId ? data.product : p))
        );
      }
    } else {
      // Create
      const res = await fetch('/api/global-products', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.product) {
        setProducts(prev => [data.product, ...prev]);
      }
    }

    setIsModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/global-products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['Todos', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition
                ${filter === cat
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={openCreateModal}
          className="ml-auto rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-md hover:bg-amber-300 transition"
        >
          + Novo Produto Global
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(gp => (
          <div
            key={gp.id}
            className="flex rounded-2xl border border-white/10 bg-white/5 p-4 gap-4 transition hover:border-white/20"
          >
            {gp.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gp.imageUrl}
                alt={gp.name}
                className="w-16 h-16 object-cover rounded-xl bg-zinc-800 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center shrink-0">
                <span className="text-lg opacity-40">📦</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{gp.name}</h3>
              <p className="text-xs mt-1 text-zinc-400 line-clamp-2">
                {gp.description || 'Sem descricao'}
              </p>
              <span className="mt-1.5 inline-block text-[10px] uppercase tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                {gp.category}
              </span>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => openEditModal(gp)}
                className="text-xs text-amber-400 hover:text-amber-300"
                title="Editar"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(gp.id)}
                className="text-xs text-rose-400 hover:text-rose-300"
                title="Excluir"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-zinc-500">
            Nenhum produto global{filter !== 'Todos' ? ` em "${filter}"` : ''}.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl bg-[#1A1D24] border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-white">
              {editingId ? 'Editar Produto Global' : 'Novo Produto Global'}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed transition border-white/20 hover:border-amber-400/50 bg-white/5"
                >
                  {formImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(formImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl opacity-40">📷</span>
                  )}
                  <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e =>
                      e.target.files && setFormImage(e.target.files[0])
                    }
                  />
                </div>
                <div className="flex-1 text-xs text-zinc-500">
                  Foto opcional. Recomendado 500x500px.
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">
                  Nome
                </label>
                <input
                  type="text"
                  autoFocus
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: X-Bacon Artesanal"
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">
                  Categoria / Nicho
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">
                  Descricao
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Ingredientes, descricao..."
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition resize-none bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim() || saving}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
