
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Home, Euro, Phone, Mail, BedDouble, Ruler, Filter, Search, Building2 } from "lucide-react";
import { CONTACT, LISTINGS as DEMO } from "./data";
import { STRINGS } from "./i18n";
import { DATA_SOURCE, SHEET_CSV_URL } from "./config";

const formatEUR = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

function Tag({ children }) { return <span className="px-2 py-0.5 text-xs border rounded-full">{children}</span>; }
function Card({ children }) { return <div className="rounded-2xl border shadow-sm bg-white">{children}</div>; }

function useListings() {
  const [items, setItems] = useState(DEMO);
  const [loading, setLoading] = useState(DATA_SOURCE === 'sheet');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (DATA_SOURCE !== 'sheet') return;
    const url = SHEET_CSV_URL;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch sheet');
        const text = await res.text();
        // Simple CSV parser
        const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.replace(/^"|"$/g, '')));
        const [header, ...data] = rows;
        const idx = (k) => header.findIndex(h => h.trim().toLowerCase() === k);
        const toNumber = (v) => (v === '' || v == null) ? null : Number(v);
        const mapped = data.map((r, i) => ({
          id: r[idx('id')] || i + 1,
          title: r[idx('title')] || 'Untitled',
          district: r[idx('district')] || '',
          price: toNumber(r[idx('price')]) ?? 0,
          beds: toNumber(r[idx('beds')]) ?? 0,
          size: toNumber(r[idx('size')]) ?? 0,
          address: r[idx('address')] || '',
          tags: (r[idx('tags')] || '').split(/\s*,\s*/).filter(Boolean),
        }));
        if (!cancelled) setItems(mapped);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}

export default function App() {
  const [lang, setLang] = useState('bg'); // 'en' | 'bg'
  const t = STRINGS[lang];
  const { items, loading, error } = useListings();

  const [q, setQ] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [beds, setBeds] = useState("any");
  const districts = useMemo(() => Array.from(new Set(items.map(l => l.district))), [items]);
  const [district, setDistrict] = useState("all");
  const [sort, setSort] = useState("price-asc");

  const filtered = useMemo(() => {
    let out = items.filter((l) => {
      const matchesQ = q.trim().length === 0 || l.title.toLowerCase().includes(q.toLowerCase()) || l.district.toLowerCase().includes(q.toLowerCase());
      const matchesBeds = beds === "any" || (beds === "studio" ? l.beds === 0 : l.beds === Number(beds));
      const matchesMin = min === "" || l.price >= Number(min);
      const matchesMax = max === "" || l.price <= Number(max);
      const matchesDistrict = district === "all" || l.district === district;
      return matchesQ && matchesBeds && matchesMin && matchesMax && matchesDistrict;
    });

    const [field, dir] = sort.split("-");
    const factor = dir === "asc" ? 1 : -1;
    out.sort((a,b) => field === "price" ? (a.price-b.price)*factor : (a.size-b.size)*factor);

    return out;
  }, [q, min, max, beds, sort, district, items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            <span className="font-semibold tracking-tight">Sofia Rentals</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#listings" className="hover:underline">{t.nav_listings}</a>
            <a href="#areas" className="hover:underline">{t.nav_areas}</a>
            <a href="#contact" className="hover:underline">{t.nav_contact}</a>
            <div className="flex items-center gap-1 border rounded-xl px-1">
              <button className={`px-2 py-1 rounded-lg ${lang==='bg'?'bg-black text-white':''}`} onClick={()=>setLang('bg')}>{t.lang_bg}</button>
              <button className={`px-2 py-1 rounded-lg ${lang==='en'?'bg-black text-white':''}`} onClick={()=>setLang('en')}>{t.lang_en}</button>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            {t.hero_title_1} <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">Sofia</span>
          </h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Curated opportunities across Lozenets, Center, Mladost, Studentski Grad and more. Transparent pricing, fast replies, human service.
          </p>
        </motion.div>

        {/* FILTERS */}
        <Card>
          <div className="p-4">
            <div className="grid md:grid-cols-7 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="q" className="mb-1 block text-sm font-medium">{t.search}</label>
                <div className="flex gap-2">
                  <input id="q" className="w-full border rounded-xl px-3 py-2" placeholder={t.search_placeholder} value={q} onChange={e=>setQ(e.target.value)} />
                  <button className="px-3 py-2 border rounded-xl" onClick={()=>setQ(q)}><Search className="w-4 h-4" /></button>
                </div>
              </div>
              <div>
                <label htmlFor="min" className="mb-1 block text-sm font-medium">{t.min}</label>
                <input id="min" type="number" min={0} className="w-full border rounded-xl px-3 py-2" placeholder="0" value={min} onChange={e=>setMin(e.target.value)} />
              </div>
              <div>
                <label htmlFor="max" className="mb-1 block text-sm font-medium">{t.max}</label>
                <input id="max" type="number" min={0} className="w-full border rounded-xl px-3 py-2" placeholder="2000" value={max} onChange={e=>setMax(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t.bedrooms}</label>
                <select value={beds} onChange={e=>setBeds(e.target.value)} className="w-full border rounded-xl px-3 py-2">
                  <option value="any">{t.any}</option>
                  <option value="studio">{t.studio}</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">District</label>
                <select value={district} onChange={e=>setDistrict(e.target.value)} className="w-full border rounded-xl px-3 py-2">
                  <option value="all">All</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t.sort}</label>
                <select value={sort} onChange={e=>setSort(e.target.value)} className="w-full border rounded-xl px-3 py-2">
                  <option value="price-asc">{t.sort_price_asc}</option>
                  <option value="price-desc">{t.sort_price_desc}</option>
                  <option value="size-asc">{t.sort_size_asc}</option>
                  <option value="size-desc">{t.sort_size_desc}</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
              <Filter className="w-4 h-4" /> {t.filter_hint}
            </div>
          </div>
        </Card>
      </section>

      {/* LISTINGS */}
      <section id="listings" className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t.featured}</h2>
          <span className="text-sm text-slate-600">{loading ? 'Loading…' : error ? 'Error' : `${filtered.length} result(s)`}</span>
        </div>
        {loading ? (
          <Card><div className="p-8 text-center text-slate-600">Loading…</div></Card>
        ) : filtered.length === 0 ? (
          <Card><div className="p-8 text-center text-slate-600">{t.no_matches}</div></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card>
                  <div className="aspect-[16/10] bg-gradient-to-br from-slate-200 to-slate-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="w-10 h-10 opacity-40" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-xs bg-white/90 border rounded-full">{item.district}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border">
                      <Euro className="w-4 h-4" /> <span className="font-semibold">{formatEUR(item.price)}/mo</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{item.address}</span>
                      <span className="inline-flex items-center gap-1"><BedDouble className="w-4 h-4" />{item.beds === 0 ? t.studio : `${item.beds} BR`}</span>
                      <span className="inline-flex items-center gap-1"><Ruler className="w-4 h-4" />{item.size} m²</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.map(tg => <Tag key={tg}>{tg}</Tag>)}
                    </div>
                    <div className="pt-4">
                      <a className="block text-center w-full rounded-xl bg-black text-white px-4 py-2" href={`mailto:${CONTACT.email}?subject=${encodeURIComponent((lang==='bg'?'Запитване: ':'Inquiry: ') + item.title + ' (' + item.district + ')')}`}>{lang==='bg'? 'Запитване' : 'Inquire'}</a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* AREAS */}
      <section id="areas" className="bg-white/60 border-y">
        <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-3 gap-6">
          {[{name:'Lozenets',text:t.lozenets},{name:'Center',text:t.center},{name:'Mladost',text:t.mladost}].map(a => (
            <Card key={a.name}><div className="p-4"><h3 className="font-semibold">{a.name}</h3><p className="text-sm text-slate-600 mt-2">{a.text}</p></div></Card>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{t.contact} {CONTACT.name}</h2>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4"/><a className="hover:underline" href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4"/><a className="hover:underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
                <div className="flex items-center gap-2">• {t.friendly}</div>
                <div className="flex items-center gap-2">• {t.viewing}</div>
                <div className="flex items-center gap-2">• {t.real_listings}</div>
                <div className="flex gap-2 pt-2">
                  <a href={`https://wa.me/${CONTACT.phone.replace(/[^\d]/g,'')}`} target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-2">WhatsApp</a>
                </div>
              </div>
              <form className="space-y-3" action={`mailto:${CONTACT.email}`} method="post" encType="text/plain">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">{t.your_name}</label>
                  <input id="name" name="name" className="w-full border rounded-xl px-3 py-2" placeholder="Иван Иванов / Jane Doe" required />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">{t.phone}</label>
                  <input id="phone" name="phone" className="w-full border rounded-xl px-3 py-2" placeholder="+359…" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium">{t.message}</label>
                  <input id="message" name="message" className="w-full border rounded-xl px-3 py-2" placeholder={lang==='bg'?"Интересувам се от…":"I’m interested in…"} required />
                </div>
                <button type="submit" className="w-full rounded-xl bg-black text-white px-4 py-2">{t.send_inquiry}</button>
              </form>
            </div>
          </Card>
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">{t.map_sofia}</h3>
            </div>
            <div className="p-4">
              <div className="rounded-xl border overflow-hidden">
                <iframe title="Sofia Map" className="w-full h-64 md:h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Sofia,Bulgaria&output=embed"></iframe>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-slate-600 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>© {new Date().getFullYear()} {t.footer_rights}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={`mailto:${CONTACT.email}`} className="inline-flex items-center gap-1 hover:underline"><Mail className="w-4 h-4"/> {CONTACT.email}</a>
            <span className="hidden md:inline">•</span>
            <a href={`tel:${CONTACT.phone}`} className="inline-flex items-center gap-1 hover:underline"><Phone className="w-4 h-4"/> {CONTACT.phone}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
