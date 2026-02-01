
import React, { useState, useMemo, useEffect } from 'react';
import { TermCard } from '../components/Card';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { TermData } from '../types';

// Helper for consistency
const getCategoryColor = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('desenvolvimento') || normalized.includes('api')) return 'primary';
  if (normalized.includes('dados') || normalized.includes('data')) return 'emerald';
  if (normalized.includes('infra') || normalized.includes('cloud')) return 'blue';
  if (normalized.includes('agile') || normalized.includes('produto')) return 'orange';
  if (normalized.includes('segurança') || normalized.includes('security')) return 'rose';
  if (normalized.includes('backend') || normalized.includes('web3')) return 'purple';
  return 'primary';
};

const categories = ["Todos", "Desenvolvimento", "Infraestrutura", "Agile & Produto", "Dados & IA", "Segurança"];

const alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

// Fallback Static Data (Initial state)
const staticGlossaryTerms: Partial<TermData>[] = [
  { id: 'api', term: 'API', category: 'Desenvolvimento', definition: 'Interface que permite que dois aplicativos se comuniquem entre si automaticamente.' },
  { id: 'agile', term: 'Agile', category: 'Agile & Produto', definition: 'Metodologia de gestão focada em entregas rápidas e melhoria contínua.' },
  { id: 'aws', term: 'AWS', category: 'Infraestrutura', definition: 'Plataforma de serviços de computação em nuvem da Amazon.' },
  { id: 'devops', term: 'DevOps', category: 'Infraestrutura', definition: 'Cultura que une desenvolvimento (Dev) e operações (Ops) para entregas mais rápidas.' },
  { id: 'docker', term: 'Docker', category: 'Infraestrutura', definition: 'Plataforma popular para criar e gerenciar containers.' },
  { id: 'kubernetes', term: 'Kubernetes', category: 'Infraestrutura', definition: 'Sistema para automatizar a gestão de aplicações em containers.' },
  { id: 'python', term: 'Python', category: 'Dados & IA', definition: 'Linguagem de programação popular em ciência de dados e automação.' },
  { id: 'sql', term: 'SQL', category: 'Dados & IA', definition: 'Linguagem padrão para gerenciar bancos de dados relacionais.' },
];

export const Glossary = () => {
  const [activeCat, setActiveCat] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  
  // Dynamic State
  const [terms, setTerms] = useState<Partial<TermData>[]>(staticGlossaryTerms);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on Mount
  useEffect(() => {
    const fetchTerms = async () => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        try {
            // Fetch minimal data needed for the card list
            const { data, error } = await supabase
                .from('terms')
                .select('id, term, category, definition')
                .order('term', { ascending: true });

            if (data && data.length > 0) {
                setTerms(data);
            }
        } catch (err) {
            console.error("Erro ao buscar glossário:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchTerms();
  }, []);

  // Filter Logic
  const filteredTerms = useMemo(() => {
    return terms.filter(item => {
      // 1. Category Filter
      const catMatch = activeCat === "Todos" || item.category === activeCat || (activeCat === 'Infraestrutura' && item.category === 'DevOps'); 

      // 2. Search Filter (Higher Priority)
      const searchLower = searchTerm.toLowerCase();
      const termLower = (item.term || '').toLowerCase();
      const defLower = (item.definition || '').toLowerCase();
      const searchMatch = !searchTerm || termLower.includes(searchLower) || defLower.includes(searchLower);

      // 3. Letter Filter (Only if no search term)
      const firstChar = (item.term || '').charAt(0).toUpperCase();
      const isAlpha = /^[A-Z]$/.test(firstChar);
      const letterMatch = !activeLetter 
        ? true 
        : activeLetter === '#' 
          ? !isAlpha 
          : firstChar === activeLetter;

      if (searchTerm) {
        return catMatch && searchMatch;
      } else {
        return catMatch && letterMatch;
      }
    }).sort((a, b) => (a.term || '').localeCompare(b.term || ''));
  }, [activeCat, searchTerm, activeLetter, terms]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value) {
      setActiveLetter(null); 
    }
  };

  const handleLetterClick = (char: string) => {
    if (activeLetter === char) {
      setActiveLetter(null); 
    } else {
      setActiveLetter(char);
      setSearchTerm(""); 
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12 flex flex-col gap-8 pb-12">
      <header className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-100">Glossário Técnico</h2>
          <p className="text-slate-400 mt-2">Dicionário descomplicado de termos tecnológicos para profissionais de negócios.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</span>
          <input 
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-night-panel border border-night-border text-slate-200 pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-slate-600 font-display text-lg" 
            placeholder="Busque por termos, siglas ou conceitos (ex: API, Backend, Agile...)" 
            type="text"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCat === cat 
                ? 'bg-primary text-night-bg border-primary font-bold shadow-lg shadow-primary/20' 
                : 'bg-night-panel border-night-border text-slate-400 hover:border-primary/50 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* A-Z Index Bar */}
        <div className="w-full border-t border-b border-night-border py-4 overflow-hidden">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                {alphabet.map((char) => (
                    <button
                        key={char}
                        onClick={() => handleLetterClick(char)}
                        className={`min-w-[36px] h-9 rounded-lg flex items-center justify-center text-sm font-bold font-mono transition-all ${
                            activeLetter === char
                            ? 'bg-primary text-night-bg shadow-md shadow-primary/20 scale-110'
                            : 'text-slate-500 hover:bg-night-panel hover:text-primary'
                        }`}
                    >
                        {char}
                    </button>
                ))}
            </div>
        </div>
      </header>

      {/* Results Grid */}
      <div className="min-h-[40vh]">
        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {loading ? 'Carregando termos...' : `${filteredTerms.length} ${filteredTerms.length === 1 ? 'Termo encontrado' : 'Termos encontrados'}`}
            </span>
            {activeLetter && (
                <span className="text-primary text-xs font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded border border-primary/20">
                    Filtro: Inicia com "{activeLetter}"
                </span>
            )}
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3,4,5,6].map(i => (
                     <div key={i} className="h-64 rounded-2xl bg-night-panel/30 animate-pulse border border-night-border"></div>
                 ))}
             </div>
        ) : filteredTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 border-2 border-dashed border-night-border rounded-3xl bg-night-panel/30">
                <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">search_off</span>
                <p className="text-slate-400 text-lg font-bold">NENHUM RESULTADO</p>
                <p className="text-slate-500 text-sm mt-2">Tente ajustar seus filtros ou termos de busca.</p>
                <button 
                    onClick={() => {setSearchTerm(''); setActiveLetter(null); setActiveCat('Todos');}}
                    className="mt-6 text-primary hover:underline font-bold text-sm"
                >
                    Limpar todos os filtros
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredTerms.map((item) => (
                    <TermCard 
                        key={item.id}
                        id={item.id}
                        title={item.term || ''} 
                        category={item.category || 'Geral'} 
                        categoryColor={getCategoryColor(item.category || '') as any}
                        icon="library_books" 
                        description={item.definition || ''}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
