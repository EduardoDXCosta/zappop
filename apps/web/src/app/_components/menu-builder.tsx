'use client';

import { api } from '@/lib/api-client';
import { useState, useEffect, useRef } from 'react';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
};

type GlobalProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
};

// ── Niches for bulk import ────────────────────────────────
const NICHES = [
  'Todos',
  'Hamburgueria',
  'Pizzaria',
  'Marmita',
  'Acai',
  'Sushi',
  'Padaria',
  'Bebidas',
  'Sobremesas',
];

export function MenuBuilder({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Inline editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState('');
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global gallery tab
  const [showGallery, setShowGallery] = useState(false);
  const [globalProducts, setGlobalProducts] = useState<GlobalProduct[]>([]);
  const [selectedGlobal, setSelectedGlobal] = useState<Set<string>>(new Set());
  const [activeNiche, setActiveNiche] = useState('Todos');
  const [importing, setImporting] = useState(false);

  // ── Load data ───────────────────────────────────────────
  useEffect(() => {
    api.get<{ categories: Category[] }>('/menu/categories').then(data => {
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0) setActiveCategory(data.categories[0].id);
      }
    });

    api.get<{ products: Product[] }>('/menu/products').then(data => {
      if (data.products) setProducts(data.products);
    });
  }, []);

  // Load global products when gallery opens
  useEffect(() => {
    if (!showGallery) return;
    api.get<{ products: GlobalProduct[] }>('/global-products').then(data => {
      if (data.products) setGlobalProducts(data.products);
    });
  }, [showGallery]);

  // Focus price input
  useEffect(() => {
    if (editingPriceId && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingPriceId]);

  // ── Handlers ────────────────────────────────────────────

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const data = await api.post<{ category: Category }>('/menu/categories', { name: newCatName });
    if (data.category) {
      setCategories(prev => [...prev, data.category]);
      setActiveCategory(data.category.id);
      setNewCatName('');
      setIsCategoryModalOpen(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim() || !activeCategory) return;

    setIsUploading(true);
    let imageUrl = null;

    if (newProdImage) {
      const formData = new FormData();
      formData.append('file', newProdImage);
      const fileData = await api.post<{ url: string }>('/upload', formData);
      if (fileData.url) imageUrl = fileData.url;
    }

    const data = await api.post<{ product: Product }>('/menu/products', {
      categoryId: activeCategory,
      name: newProdName,
      price: parseFloat(newProdPrice.replace(',', '.')),
      description: newProdDesc,
      imageUrl,
    });

    if (data.product) {
      setProducts(prev => [data.product, ...prev]);
      setNewProdName('');
      setNewProdPrice('');
      setNewProdDesc('');
      setNewProdImage(null);
      setIsProductModalOpen(false);
    }
    setIsUploading(false);
  };

  // Inline price save
  const handlePriceSave = async (productId: string) => {
    const newPrice = parseFloat(editingPriceValue.replace(',', '.'));
    if (isNaN(newPrice) || newPrice < 0) {
      setEditingPriceId(null);
      return;
    }

    try {
      await api.patch(`/menu/products/${productId}`, { price: newPrice });
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, price: newPrice } : p))
      );
    } catch {
      // leave price unchanged on error
    }
    setEditingPriceId(null);
  };

  // Toggle availability
  const handleToggleAvailability = async (productId: string, current: boolean) => {
    try {
      await api.patch(`/menu/products/${productId}`, { available: !current });
      setProducts(prev =>
        prev.map(p =>
          p.id === productId ? { ...p, available: !current } : p
        )
      );
    } catch {
      // leave state unchanged on error
    }
  };

  // Bulk import from global gallery
  const handleBulkImport = async () => {
    if (selectedGlobal.size === 0 || !activeCategory) return;
    setImporting(true);

    const results = await Promise.allSettled(
      Array.from(selectedGlobal).map(globalProductId =>
        api.post<{ product: Product }>('/menu/products/clone', {
          globalProductId,
          categoryId: activeCategory,
          price: 0,
        })
      )
    );

    const newProducts: Product[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.product) {
        newProducts.push(r.value.product);
      }
    }

    if (newProducts.length > 0) {
      setProducts(prev => [...newProducts, ...prev]);
    }

    setSelectedGlobal(new Set());
    setShowGallery(false);
    setImporting(false);
  };

  // Toggle select/deselect global product
  const toggleGlobalSelect = (id: string) => {
    setSelectedGlobal(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    const visible = filteredGlobalProducts.map(p => p.id);
    setSelectedGlobal(new Set(visible));
  };

  const deselectAll = () => setSelectedGlobal(new Set());

  // Filter global products by niche
  const filteredGlobalProducts =
    activeNiche === 'Todos'
      ? globalProducts
      : globalProducts.filter(
          p => p.category.toLowerCase() === activeNiche.toLowerCase()
        );

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 h-full w-full rounded-3xl shadow-2xl overflow-hidden bg-[#11131A] text-white border border-white/10">
      {/* HEADER */}
      <header className="px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between sticky top-0 z-10 bg-[#11131A]/90 border-white/10 border-b backdrop-blur-md">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold">{tenantName}</h1>
          <p className="text-xs sm:text-sm mt-1 text-zinc-400">Cardapio Online</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className={`rounded-full px-4 sm:px-5 py-2.5 text-sm font-bold transition-all border
              ${showGallery
                ? 'bg-amber-400 text-black border-amber-400'
                : 'bg-white/5 text-amber-300 border-amber-400/30 hover:bg-amber-400/10'
              }`}
          >
            {showGallery ? 'Voltar ao Cardapio' : 'Galeria Global'}
          </button>
        </div>
      </header>

      {/* ─── GLOBAL GALLERY TAB ──────────────────────── */}
      {showGallery ? (
        <div className="flex-1 overflow-y-auto">
          {/* Niche filter */}
          <div className="px-4 sm:px-8 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar border-b border-white/5">
            {NICHES.map(niche => (
              <button
                key={niche}
                onClick={() => setActiveNiche(niche)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm
                  ${activeNiche === niche
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
                  }`}
              >
                {niche}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          <div className="px-4 sm:px-8 py-3 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <button
                onClick={selectedGlobal.size === filteredGlobalProducts.length ? deselectAll : selectAllVisible}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 transition"
              >
                {selectedGlobal.size === filteredGlobalProducts.length && filteredGlobalProducts.length > 0
                  ? 'Desmarcar tudo'
                  : 'Selecionar tudo'}
              </button>
              {selectedGlobal.size > 0 && (
                <span className="text-xs text-zinc-500">
                  {selectedGlobal.size} selecionado{selectedGlobal.size > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {selectedGlobal.size > 0 && activeCategory && (
              <button
                onClick={handleBulkImport}
                disabled={importing}
                className="rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-md hover:bg-amber-300 transition disabled:opacity-50"
              >
                {importing
                  ? 'Importando...'
                  : `Importar ${selectedGlobal.size} para meu cardapio`}
              </button>
            )}
          </div>

          {!activeCategory && (
            <div className="px-8 py-4">
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-sm text-amber-200">
                Crie uma categoria primeiro para poder importar produtos.
              </div>
            </div>
          )}

          {/* Global products grid */}
          <div className="p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGlobalProducts.map(gp => {
              const isSelected = selectedGlobal.has(gp.id);
              return (
                <div
                  key={gp.id}
                  onClick={() => toggleGlobalSelect(gp.id)}
                  className={`flex rounded-2xl border p-4 gap-4 cursor-pointer transition-all
                    ${isSelected
                      ? 'border-amber-400/50 bg-amber-400/8 ring-1 ring-amber-400/30'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-start pt-1">
                    <div
                      className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all
                        ${isSelected
                          ? 'bg-amber-400 border-amber-400'
                          : 'border-white/20 bg-transparent'
                        }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{gp.name}</h3>
                    <p className="text-xs mt-1 text-zinc-400 line-clamp-2">
                      {gp.description || 'Sem descricao'}
                    </p>
                    <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {gp.category}
                    </span>
                  </div>
                  {/* Image */}
                  {gp.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gp.imageUrl}
                      alt={gp.name}
                      className="w-16 h-16 object-cover rounded-xl bg-zinc-800"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                      <span className="text-lg opacity-40">📦</span>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredGlobalProducts.length === 0 && (
              <div className="col-span-full text-center py-16 text-zinc-500">
                Nenhum produto global neste nicho.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── NORMAL MENU VIEW ──────────────────────── */
        <>
          {/* Category carousel */}
          <div className="px-4 sm:px-8 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar border-b border-white/5">
            {categories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm
                    ${isActive
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
                    }`}
                >
                  {cat.name}
                </button>
              );
            })}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold border border-dashed border-white/30 text-white hover:bg-white/10 transition-all"
            >
              + Nova Categoria
            </button>
          </div>

          {/* Product list */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0A0B0F]/50">
            {!activeCategory ? (
              <div className="flex flex-col items-center justify-center h-48 opacity-60">
                <p className="text-lg">Adicione uma Categoria primeiro</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight">
                    {categories.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="text-sm font-bold bg-amber-400 text-black px-4 py-2 rounded-xl shadow-md hover:bg-amber-300 transition"
                  >
                    + Adicionar Produto
                  </button>
                </div>

                {/* Products grid with inline editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products
                    .filter(p => p.categoryId === activeCategory)
                    .map(product => (
                      <div
                        key={product.id}
                        className={`flex rounded-2xl border p-4 sm:p-5 gap-4 transition hover:shadow-md
                          ${product.available
                            ? 'bg-white/5 border-white/10 hover:border-white/20'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                          }`}
                      >
                        {/* Text left */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base">{product.name}</h3>
                              {/* Availability toggle */}
                              <button
                                onClick={() =>
                                  handleToggleAvailability(product.id, product.available)
                                }
                                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors
                                  ${product.available ? 'bg-emerald-500' : 'bg-zinc-600'}
                                `}
                                title={product.available ? 'Disponivel' : 'Indisponivel'}
                              >
                                <span
                                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5
                                    ${product.available ? 'translate-x-4' : 'translate-x-0.5'}
                                  `}
                                />
                              </button>
                            </div>
                            <p className="text-xs mt-1.5 leading-snug line-clamp-2 text-zinc-400">
                              {product.description || 'Delicioso item feito com carinho.'}
                            </p>
                          </div>
                          <div className="mt-3">
                            {/* Inline price editing */}
                            {editingPriceId === product.id ? (
                              <input
                                ref={priceInputRef}
                                type="text"
                                value={editingPriceValue}
                                onChange={e => setEditingPriceValue(e.target.value)}
                                onBlur={() => handlePriceSave(product.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handlePriceSave(product.id);
                                  if (e.key === 'Escape') setEditingPriceId(null);
                                }}
                                className="w-28 rounded-lg bg-amber-400/10 border border-amber-400/40 px-2.5 py-1 text-sm font-bold text-amber-400 outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingPriceId(product.id);
                                  setEditingPriceValue(
                                    Number(product.price).toFixed(2).replace('.', ',')
                                  );
                                }}
                                className="font-bold text-sm px-2.5 py-1 rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 transition cursor-text"
                                title="Clique para editar o preco"
                              >
                                R$ {Number(product.price).toFixed(2).replace('.', ',')}
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Image right */}
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-[1.2rem] bg-zinc-100 shadow-sm border border-black/5"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.2rem] flex items-center justify-center border border-dashed bg-white/5 border-white/10">
                            <span className="text-2xl opacity-40">🍔</span>
                          </div>
                        )}
                      </div>
                    ))}
                  {products.filter(p => p.categoryId === activeCategory).length === 0 && (
                    <div className="col-span-1 md:col-span-2 text-center py-12 border border-dashed rounded-2xl border-white/10 text-zinc-500">
                      Nenhum produto cadastrado nesta categoria.
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* ─── MODAL NOVA CATEGORIA ──────────────────── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl bg-[#1A1D24] border border-white/10">
            <h3 className="text-xl font-bold mb-4">Nova Categoria</h3>
            <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Ex: Pizzas, Bebidas..."
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                autoFocus
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL NOVO PRODUTO ────────────────────── */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl bg-[#1A1D24] border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Novo Produto</h3>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed transition border-white/20 hover:border-amber-400/50 bg-white/5"
                >
                  {newProdImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(newProdImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <span className="text-2xl mb-1">📷</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                        Upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={e => e.target.files && setNewProdImage(e.target.files[0])}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">
                    Foto (Opcional)
                  </label>
                  <p className="text-xs opacity-50 ml-2 mt-1">Recomendado: 500x500px JPEG.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: X-Salada Especial"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">
                  Preco (R$)
                </label>
                <input
                  type="text"
                  placeholder="29,90"
                  value={newProdPrice}
                  onChange={e => setNewProdPrice(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-2">
                  Descricao Longa
                </label>
                <textarea
                  rows={3}
                  placeholder="Ingredientes..."
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  className="mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition resize-none bg-black/50 border-white/10 focus:border-amber-400/50 text-white"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newProdName.trim() || !newProdPrice.trim() || isUploading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50"
                >
                  {isUploading ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
