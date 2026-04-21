import { useState, useEffect, useCallback } from "react";

const SPORTS = [
  { id: "nfl", label: "NFL", emoji: "🏈", espnSlug: "football/nfl", color: "#013369" },
  { id: "nba", label: "NBA", emoji: "🏀", espnSlug: "basketball/nba", color: "#C9082A" },
  { id: "mls", label: "MLS", emoji: "⚽", espnSlug: "soccer/usa.1", color: "#1A4B8C" },
  { id: "epl", label: "Premier League", emoji: "⚽", espnSlug: "soccer/eng.1", color: "#380361" },
  { id: "seriea", label: "Serie A", emoji: "⚽", espnSlug: "soccer/ita.1", color: "#1A56A0" },
  { id: "laliga", label: "La Liga", emoji: "⚽", espnSlug: "soccer/esp.1", color: "#EE8707" },
  { id: "ucl", label: "Champions League", emoji: "⚽", espnSlug: "soccer/uefa.champions", color: "#1B3A6B" },
  { id: "worldcup", label: "World Cup", emoji: "🏆", espnSlug: "soccer/fifa.world", color: "#326295" },
];

const BROADCASTER_MAP = {
  "ESPN": { url: "https://www.espn.com/watch/", color: "#CC0000", bg: "#CC0000", textColor: "#fff" },
  "ESPN+": { url: "https://plus.espn.com/", color: "#CC0000", bg: "#CC0000", textColor: "#fff" },
  "ESPN2": { url: "https://www.espn.com/watch/", color: "#CC0000", bg: "#CC0000", textColor: "#fff" },
  "ESPNU": { url: "https://www.espn.com/watch/", color: "#CC0000", bg: "#CC0000", textColor: "#fff" },
  "ABC": { url: "https://abc.com/watch-live", color: "#000080", bg: "#000080", textColor: "#fff" },
  "NBC": { url: "https://www.nbc.com/live", color: "#D4A017", bg: "#D4A017", textColor: "#000" },
  "Peacock": { url: "https://www.peacocktv.com/", color: "#000000", bg: "#000000", textColor: "#fff" },
  "FOX": { url: "https://www.fox.com/live/", color: "#003366", bg: "#003366", textColor: "#fff" },
  "FS1": { url: "https://www.foxsports.com/live", color: "#003366", bg: "#003366", textColor: "#fff" },
  "FS2": { url: "https://www.foxsports.com/live", color: "#003366", bg: "#003366", textColor: "#fff" },
  "CBS": { url: "https://www.cbssports.com/live/", color: "#003DA5", bg: "#003DA5", textColor: "#fff" },
  "Paramount+": { url: "https://www.paramountplus.com/", color: "#0064FF", bg: "#0064FF", textColor: "#fff" },
  "TNT": { url: "https://www.tntdrama.com/watchtnt", color: "#E03A3E", bg: "#E03A3E", textColor: "#fff" },
  "TBS": { url: "https://www.tbs.com/watchtbs", color: "#FF6600", bg: "#FF6600", textColor: "#fff" },
  "truTV": { url: "https://www.trutv.com/", color: "#E03A3E", bg: "#E03A3E", textColor: "#fff" },
  "Apple TV+": { url: "https://tv.apple.com/", color: "#555555", bg: "#555555", textColor: "#fff" },
  "Prime Video": { url: "https://www.amazon.com/primevideo", color: "#00A8E0", bg: "#00A8E0", textColor: "#fff" },
  "Max": { url: "https://www.max.com/", color: "#002BE7", bg: "#002BE7", textColor: "#fff" },
  "Univision": { url: "https://www.univision.com/", color: "#FF6600", bg: "#FF6600", textColor: "#fff" },
  "TUDN": { url: "https://www.tudn.com/", color: "#CC0000", bg: "#CC0000", textColor: "#fff" },
  "USA Network": { url: "https://www.usanetwork.com/live", color: "#003DA5", bg: "#003DA5", textColor: "#fff" },
  "NFL Network": { url: "https://www.nfl.com/network/watch", color: "#013369", bg: "#013369", textColor: "#fff" },
  "NBA TV": { url: "https://www.nba.com/watch", color: "#C9082A", bg: "#C9082A", textColor: "#fff" },
  "NBATV": { url: "https://www.nba.com/watch", color: "#C9082A", bg: "#C9082A", textColor: "#fff" },
  "CBS Sports Network": { url: "https://www.cbssports.com/live/", color: "#003DA5", bg: "#003DA5", textColor: "#fff" },
  "CBSSN": { url: "https://www.cbssports.com/live/", color: "#003DA5", bg: "#003DA5", textColor: "#fff" },
  "beIN SPORTS": { url: "https://www.beinsports.com/us/", color: "#8B1A1A", bg: "#8B1A1A", textColor: "#fff" },
};

const LEAGUE_BROADCASTER_FALLBACK = {
  epl: [{ name: "Peacock", note: "Most EPL matches stream on Peacock" }, { name: "USA Network", note: "Select matches on USA Network" }],
  ucl: [{ name: "Paramount+", note: "Champions League streams on Paramount+" }, { name: "CBS", note: "Select matches on CBS" }],
  seriea: [{ name: "Paramount+", note: "Serie A streams on Paramount+" }, { name: "CBS Sports Network", note: "Select matches on CBS Sports Network" }],
  laliga: [{ name: "ESPN+", note: "La Liga streams exclusively on ESPN+" }],
  worldcup: [{ name: "FOX", note: "World Cup on FOX" }, { name: "Univision", note: "Spanish broadcast on Univision" }, { name: "FS1", note: "Additional matches on FS1" }],
  mls: [{ name: "Apple TV+", note: "MLS Season Pass on Apple TV+" }, { name: "ESPN+", note: "Select matches on ESPN+" }],
  nfl: [{ name: "NFL Network", note: "Check NFL Network for this game" }],
  nba: [{ name: "NBA TV", note: "Check NBA TV for this game" }],
};

const STATUS_LABELS = {
  "STATUS_SCHEDULED": "Upcoming",
  "STATUS_IN_PROGRESS": "LIVE",
  "STATUS_HALFTIME": "Halftime",
  "STATUS_FINAL": "Final",
  "STATUS_FULL_TIME": "Final",
  "STATUS_END_PERIOD": "Break",
  "STATUS_POSTPONED": "Postponed",
  "STATUS_CANCELED": "Canceled",
  "STATUS_SUSPENDED": "Suspended",
};

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const gameDay = new Date(d); gameDay.setHours(0,0,0,0);
  if (gameDay.getTime() === today.getTime()) return "Today";
  if (gameDay.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDateKey(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year:"numeric", month:"2-digit", day:"2-digit" });
}

function parseBroadcasters(broadcastArr) {
  if (!broadcastArr || broadcastArr.length === 0) return [];
  return broadcastArr
    .filter(b => b.market === "National" || b.market === "national" || !b.market)
    .map(b => b.names || b.name || b.shortName || "")
    .flat()
    .filter(Boolean)
    .map(n => n.trim())
    .filter(n => n.length > 0);
}

function BroadcasterBadge({ name, compact }) {
  const info = BROADCASTER_MAP[name] || { bg: "#555", textColor: "#fff" };
  return (
    <span style={{
      display: "inline-block",
      background: info.bg,
      color: info.textColor,
      fontSize: compact ? "11px" : "12px",
      fontWeight: 600,
      padding: compact ? "2px 7px" : "3px 10px",
      borderRadius: "4px",
      letterSpacing: "0.3px",
      whiteSpace: "nowrap",
    }}>{name}</span>
  );
}

function GameCard({ game, sport, onClick }) {
  const home = game.competitions?.[0]?.competitors?.find(c => c.homeAway === "home");
  const away = game.competitions?.[0]?.competitors?.find(c => c.homeAway === "away");
  const status = game.status?.type?.name || "";
  const statusLabel = STATUS_LABELS[status] || game.status?.type?.shortDetail || "";
  const isLive = status === "STATUS_IN_PROGRESS" || status === "STATUS_HALFTIME" || status === "STATUS_END_PERIOD";
  const isFinal = status === "STATUS_FINAL" || status === "STATUS_FULL_TIME";
  const rawBroadcasters = game.competitions?.[0]?.broadcasts || [];
  const broadcasters = parseBroadcasters(rawBroadcasters);

  return (
    <div onClick={onClick} style={{
      background: "var(--color-background-primary)",
      border: "0.5px solid var(--color-border-tertiary)",
      borderRadius: "var(--border-radius-lg)",
      padding: "14px 18px",
      cursor: "pointer",
      transition: "border-color 0.15s, background 0.15s",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-border-secondary)"; e.currentTarget.style.background = "var(--color-background-secondary)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border-tertiary)"; e.currentTarget.style.background = "var(--color-background-primary)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
          {isLive ? "" : formatTime(game.date)}
        </span>
        <span style={{
          fontSize: "11px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "20px",
          background: isLive ? "#ff3b3b" : isFinal ? "var(--color-background-tertiary)" : "var(--color-background-secondary)",
          color: isLive ? "#fff" : "var(--color-text-secondary)",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}>
          {isLive ? "● LIVE" : statusLabel || "Scheduled"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <TeamDisplay competitor={away} isFinal={isFinal} isLive={isLive} />
        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text-tertiary)", flexShrink: 0 }}>vs</span>
        <TeamDisplay competitor={home} isFinal={isFinal} isLive={isLive} align="right" />
      </div>

      {broadcasters.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {broadcasters.slice(0,3).map(b => <BroadcasterBadge key={b} name={b} compact />)}
        </div>
      )}
    </div>
  );
}

function TeamDisplay({ competitor, isFinal, isLive, align }) {
  const team = competitor?.team || {};
  const score = competitor?.score;
  const isWinner = competitor?.winner;
  return (
    <div style={{ display: "flex", flexDirection: align === "right" ? "row-reverse" : "row", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
      {team.logo ? (
        <img src={team.logo} alt={team.shortDisplayName} style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} />
      ) : (
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-background-tertiary)", flexShrink: 0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:600, color:"var(--color-text-secondary)" }}>
          {(team.abbreviation || "?").slice(0,3)}
        </div>
      )}
      <div style={{ minWidth: 0, textAlign: align === "right" ? "right" : "left" }}>
        <div style={{ fontSize: "14px", fontWeight: isWinner ? 600 : 400, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {team.shortDisplayName || team.displayName || "TBD"}
        </div>
        {(isFinal || isLive) && score !== undefined && (
          <div style={{ fontSize: "20px", fontWeight: 700, color: isWinner ? "var(--color-text-primary)" : "var(--color-text-secondary)", lineHeight: 1 }}>{score}</div>
        )}
      </div>
    </div>
  );
}

function GameDetailPanel({ game, sport, onClose }) {
  if (!game) return null;
  const home = game.competitions?.[0]?.competitors?.find(c => c.homeAway === "home");
  const away = game.competitions?.[0]?.competitors?.find(c => c.homeAway === "away");
  const status = game.status?.type?.name || "";
  const isLive = status === "STATUS_IN_PROGRESS" || status === "STATUS_HALFTIME";
  const isFinal = status === "STATUS_FINAL" || status === "STATUS_FULL_TIME";
  const rawBroadcasters = game.competitions?.[0]?.broadcasts || [];
  const broadcasters = parseBroadcasters(rawBroadcasters);
  const venue = game.competitions?.[0]?.venue;
  const note = game.competitions?.[0]?.notes?.[0]?.headline || "";

  const fallback = LEAGUE_BROADCASTER_FALLBACK[sport.id] || [];
  const allBroadcasters = broadcasters.length > 0
    ? broadcasters.map(name => ({ name, note: null }))
    : fallback;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--color-background-primary)",
        borderRadius: "var(--border-radius-xl)",
        border: "0.5px solid var(--color-border-secondary)",
        width: "100%", maxWidth: "500px",
        maxHeight: "90vh", overflowY: "auto",
        padding: "28px",
        display: "flex", flexDirection: "column", gap: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
              {sport.emoji} {sport.label}
            </div>
            {note && <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>{note}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "20px", color: "var(--color-text-secondary)", lineHeight: 1, padding: "0 0 0 12px",
          }}>✕</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <TeamDisplay competitor={away} isFinal={isFinal} isLive={isLive} />
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            {(isLive || isFinal) ? (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: 700 }}>{away?.score ?? "–"}</span>
                <span style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>–</span>
                <span style={{ fontSize: "28px", fontWeight: 700 }}>{home?.score ?? "–"}</span>
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", fontWeight: 500 }}>{formatTime(game.date)}</div>
            )}
            <div style={{
              fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
              color: isLive ? "#ff3b3b" : "var(--color-text-tertiary)",
              marginTop: "4px",
            }}>
              {isLive ? "● Live" : STATUS_LABELS[status] || "Scheduled"}
            </div>
          </div>
          <TeamDisplay competitor={home} isFinal={isFinal} isLive={isLive} align="right" />
        </div>

        {venue?.fullName && (
          <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", textAlign: "center", paddingBottom: "4px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            📍 {venue.fullName}{venue.address?.city ? `, ${venue.address.city}` : ""}
          </div>
        )}

        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Where to watch
          </div>
          {allBroadcasters.length === 0 ? (
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)", padding: "12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
              Broadcast info not yet available. Check back closer to game time.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allBroadcasters.map(({ name, note: bNote }, i) => {
                const info = BROADCASTER_MAP[name] || { bg: "#555", textColor: "#fff", url: null };
                const isStream = ["ESPN+", "Peacock", "Paramount+", "Apple TV+", "Prime Video", "Max", "NBA TV"].includes(name);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--color-background-secondary)",
                    borderRadius: "var(--border-radius-md)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    gap: "12px",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <BroadcasterBadge name={name} />
                        <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)", background: "var(--color-background-tertiary)", padding: "1px 6px", borderRadius: "4px" }}>
                          {isStream ? "Streaming" : "TV"}
                        </span>
                      </div>
                      {bNote && <div style={{ fontSize: "12px", color: "var(--color-text-secondary)", marginTop: "2px" }}>{bNote}</div>}
                    </div>
                    {info.url && (
                      <a href={info.url} target="_blank" rel="noreferrer" style={{
                        display: "inline-block", fontSize: "13px", fontWeight: 600,
                        color: info.bg, border: `1px solid ${info.bg}`,
                        padding: "6px 14px", borderRadius: "6px",
                        textDecoration: "none", whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>Watch →</a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SportZone() {
  const [activeSport, setActiveSport] = useState(SPORTS[0]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState("today");
  const [selectedGame, setSelectedGame] = useState(null);

  const fetchGames = useCallback(async (sport) => {
    setLoading(true);
    setError(null);
    setGames([]);
    try {
      const now = new Date();
      const end = new Date(now);
      end.setDate(now.getDate() + 7);
      const fmt = d => d.toISOString().slice(0,10).replace(/-/g,"");
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sport.espnSlug}/scoreboard?dates=${fmt(now)}-${fmt(end)}&limit=100`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setGames(data.events || []);
    } catch (e) {
      setError("Could not load games. Please try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchGames(activeSport); }, [activeSport]);

  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate()+2);

  const todayKey = today.toLocaleDateString("en-US",{year:"numeric",month:"2-digit",day:"2-digit"});
  const tomorrowKey = tomorrow.toLocaleDateString("en-US",{year:"numeric",month:"2-digit",day:"2-digit"});

  const groupedGames = {};
  games.forEach(g => {
    const key = getDateKey(g.date);
    if (!groupedGames[key]) groupedGames[key] = [];
    groupedGames[key].push(g);
  });

  let filteredGames = [];
  let dayLabel = "";
  if (activeDay === "today") {
    filteredGames = groupedGames[todayKey] || [];
    dayLabel = "Today";
  } else if (activeDay === "tomorrow") {
    filteredGames = groupedGames[tomorrowKey] || [];
    dayLabel = "Tomorrow";
  } else {
    const laterKeys = Object.keys(groupedGames).filter(k => k !== todayKey && k !== tomorrowKey).sort();
    laterKeys.forEach(k => filteredGames.push(...groupedGames[k]));
    dayLabel = "This Week";
  }

  const hasTodayGames = !!(groupedGames[todayKey]?.length);
  const hasTomorrowGames = !!(groupedGames[tomorrowKey]?.length);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)" }}>
      <div style={{
        background: "var(--color-background-primary)",
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0 24px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.5px" }}>SportZone</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "1px", scrollbarWidth: "none" }}>
            {SPORTS.map(s => (
              <button key={s.id} onClick={() => { setActiveSport(s); setActiveDay("today"); }}
                style={{
                  background: activeSport.id === s.id ? "var(--color-background-info)" : "none",
                  border: "none", cursor: "pointer",
                  padding: "8px 14px", borderRadius: "8px 8px 0 0",
                  fontSize: "13px", fontWeight: activeSport.id === s.id ? 600 : 400,
                  color: activeSport.id === s.id ? "var(--color-text-info)" : "var(--color-text-secondary)",
                  whiteSpace: "nowrap", transition: "all 0.15s",
                  borderBottom: activeSport.id === s.id ? "2px solid #378ADD" : "2px solid transparent",
                }}>
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 24px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[
            { key: "today", label: "Today", count: groupedGames[todayKey]?.length || 0 },
            { key: "tomorrow", label: "Tomorrow", count: groupedGames[tomorrowKey]?.length || 0 },
            { key: "week", label: "This Week", count: Object.keys(groupedGames).filter(k => k !== todayKey && k !== tomorrowKey).reduce((a,k) => a + (groupedGames[k]?.length||0), 0) },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveDay(tab.key)} style={{
              background: activeDay === tab.key ? "var(--color-background-primary)" : "none",
              border: activeDay === tab.key ? "0.5px solid var(--color-border-secondary)" : "0.5px solid transparent",
              borderRadius: "var(--border-radius-md)",
              padding: "8px 16px", cursor: "pointer",
              fontSize: "14px", fontWeight: activeDay === tab.key ? 600 : 400,
              color: activeDay === tab.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeDay === tab.key ? "var(--color-background-info)" : "var(--color-background-secondary)",
                  color: activeDay === tab.key ? "var(--color-text-info)" : "var(--color-text-secondary)",
                  fontSize: "11px", fontWeight: 600, borderRadius: "20px",
                  padding: "1px 7px", minWidth: "20px", textAlign: "center",
                }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-secondary)" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>{activeSport.emoji}</div>
            <div style={{ fontSize: "15px" }}>Loading {activeSport.label} games…</div>
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚠️</div>
            <div style={{ fontSize: "15px", color: "var(--color-text-secondary)", marginBottom: "16px" }}>{error}</div>
            <button onClick={() => fetchGames(activeSport)} style={{ padding: "10px 24px", borderRadius: "var(--border-radius-md)", cursor: "pointer" }}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredGames.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>{activeSport.emoji}</div>
            <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: "6px" }}>No {activeSport.label} games {dayLabel.toLowerCase()}</div>
            <div style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>Try checking another day or a different sport.</div>
          </div>
        )}

        {!loading && !error && filteredGames.length > 0 && (
          activeDay === "week" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {Object.keys(groupedGames).filter(k => k !== todayKey && k !== tomorrowKey).sort().map(key => (
                <div key={key}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                    {formatDateLabel(groupedGames[key][0].date)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                    {groupedGames[key].map(g => (
                      <GameCard key={g.id} game={g} sport={activeSport} onClick={() => setSelectedGame(g)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {filteredGames.map(g => (
                <GameCard key={g.id} game={g} sport={activeSport} onClick={() => setSelectedGame(g)} />
              ))}
            </div>
          )
        )}
      </div>

      {selectedGame && (
        <GameDetailPanel
          game={selectedGame}
          sport={activeSport}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
