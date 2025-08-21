"use client";

import { useEffect, useState } from "react";

interface SteamApp {
  appid: number;
  name: string;
}

export default function Home() {
  const [apps, setApps] = useState<SteamApp[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<SteamApp[]>([]);
  const [loading, setLoading] = useState(true);
  const bannedWords = ["hentai", "nsfw", "18+", "porn", "sex", "digital artbook", "digital art book", "art book", "soundtrack dlc", "soundtrack" , "soundtrack trailer"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/steam");
        const data = await res.json();
        // remove apps sem nome
        
        const validApps = data.applist.apps.filter(
          (app: SteamApp) =>
            app.name &&
            app.name.trim() !== "" &&
            !bannedWords.some((word) => app.name.toLocaleLowerCase().includes(word)) // remove jogos com "hentai"
          );

        setApps(validApps);
        setFiltered(validApps.slice(0, 50));
      } catch (err) {
        console.error("Erro ao buscar API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  

  useEffect(() => {
    if (search.trim() === "") {
      setFiltered(apps.slice(0, 50));
    } else {
      const results = apps.filter((app) =>
        app.name.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(results.slice(0, 50));
    }
  }, [search, apps]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">🎮 Steam Apps</h1>

      <input
        type="text"
        placeholder="Digite o nome do jogo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded-md shadow mb-6"
      />

      {loading ? (
        <p>Carregando jogos...</p>
      ) : filtered.length > 0 ? (
        <ul className="space-y-2">
          {filtered.map((app) => (
            <li key={app.appid} className="p-2 rounded-md">
              {app.name} (ID: {app.appid})
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum jogo encontrado 😢</p>
      )}
    </main>
  );
}
