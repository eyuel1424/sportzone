import { useState, useEffect, useCallback, useRef } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');`;

const GLOBAL_STYLES = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080b12; color:#f0f0f0; font-family:'DM Sans',sans-serif; min-height:100vh; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:#0f1420; }
  ::-webkit-scrollbar-thumb { background:#2a2f3f; border-radius:4px; }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp   { from{transform:translateY(100%)} to{transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,59,59,0.5),0 4px 24px rgba(0,0,0,0.5)} 50%{box-shadow:0 0 0 5px rgba(255,59,59,0.1),0 4px 24px rgba(0,0,0,0.5)} }
  @keyframes heroFade  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flashUpdate { 0%{opacity:1} 40%{opacity:0.3} 100%{opacity:1} }
  .card-hover { transition:transform 0.2s ease,border-color 0.2s ease,box-shadow 0.2s ease; cursor:pointer; }
  .card-hover:hover { transform:translateY(-3px); box-shadow:0 8px 32px rgba(0,0,0,0.5); }
  .card-live { border-color:rgba(255,59,59,0.5)!important; animation:livePulse 2.5s ease-in-out infinite; }
  .card-hover:not(.card-live):hover { border-color:rgba(99,179,237,0.35)!important; }
  .sport-btn { transition:all 0.18s ease; cursor:pointer; }
  .sport-btn:hover { background:rgba(255,255,255,0.06)!important; }
  .watch-btn { transition:all 0.18s ease; }
  .watch-btn:hover { transform:scale(1.04); opacity:0.88; }
  .refresh-btn { transition:all 0.2s ease; cursor:pointer; }
  .refresh-btn:hover { background:rgba(255,255,255,0.08)!important; }
  .refresh-btn:active { transform:scale(0.95); }
  .skeleton { background:linear-gradient(90deg,#141820 25%,#1e2535 50%,#141820 75%); background-size:600px 100%; animation:shimmer 1.5s infinite; border-radius:12px; }
  .spinning { animation:spin 0.7s linear infinite; display:inline-block; }
  .timestamp-flash { animation:flashUpdate 0.6s ease; }
  .detail-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.78); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn 0.2s ease; }
  .detail-panel { background:#0f1420; border:1px solid #1e2535; border-radius:20px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; padding:28px; display:flex; flex-direction:column; gap:22px; animation:fadeUp 0.25s ease both; }
  .tabs-wrap { display:flex; gap:2px; overflow-x:auto; flex-wrap:nowrap; padding-bottom:2px; scrollbar-width:none; -ms-overflow-style:none; -webkit-overflow-scrolling:touch; }
  .tabs-wrap::-webkit-scrollbar { display:none; }
  .day-tabs { display:flex; gap:8px; margin-bottom:22px; overflow-x:auto; flex-wrap:nowrap; scrollbar-width:none; -ms-overflow-style:none; -webkit-overflow-scrolling:touch; }
  .day-tabs::-webkit-scrollbar { display:none; }
  .day-tabs button { flex-shrink:0; }
  @media (max-width:640px) {
    .detail-overlay { align-items:flex-end; padding:0; }
    .detail-panel { border-radius:20px 20px 0 0; max-height:92vh; animation:slideUp 0.3s cubic-bezier(0.32,0.72,0,1) both; padding:20px 16px; }
    .hero-headline { font-size:32px!important; letter-spacing:2px!important; margin-bottom:6px!important; }
    .hero-tagline  { font-size:12px!important; max-width:100%!important; }
    .hero-section  { padding:16px 16px 12px!important; }
    .header-date   { display:none!important; }
    .header-timestamp { font-size:10px!important; }
    .sport-btn-label { display:none; }
    .sport-btn { padding:6px 10px!important; flex-shrink:0; }
  }
`;

const ALL_SPORTS_ID = "all";

const SPORTS = [
  { id:"nfl",      label:"NFL",              emoji:"🏈", sport:"football",   league:"nfl",            accent:"#4A90D9" },
  { id:"nba",      label:"NBA",              emoji:"🏀", sport:"basketball", league:"nba",            accent:"#C9082A" },
  { id:"mls",      label:"MLS",              emoji:"⚽", sport:"soccer",     league:"usa.1",          accent:"#1A9E6E" },
  { id:"epl",      label:"Premier League",   emoji:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", sport:"soccer",     league:"eng.1",          accent:"#7B2FBE" },
  { id:"seriea",   label:"Serie A",          emoji:"🇮🇹", sport:"soccer",     league:"ita.1",          accent:"#1A56A0" },
  { id:"laliga",   label:"La Liga",          emoji:"🇪🇸", sport:"soccer",     league:"esp.1",          accent:"#EE8707" },
  { id:"ucl",      label:"Champions League", emoji:"⭐", sport:"soccer",     league:"uefa.champions", accent:"#4A90D9" },
  { id:"worldcup", label:"World Cup",        emoji:"🏆", sport:"soccer",     league:"fifa.world",     accent:"#326295" },
];

const STREAMING_ALTS = {
  "Fubo":       { url:"https://www.fubo.tv/",            bg:"#E8173E", text:"#fff" },
  "Sling":      { url:"https://www.sling.com/",          bg:"#1C6EF2", text:"#fff" },
  "YouTube TV": { url:"https://tv.youtube.com/",         bg:"#FF0000", text:"#fff" },
  "Hulu Live":  { url:"https://www.hulu.com/live-tv",    bg:"#1CE783", text:"#000" },
  "DirecTV":    { url:"https://www.directv.com/stream/", bg:"#00A8E0", text:"#fff" },
};

const BROADCASTER_MAP = {
  "ESPN":              { url:"https://www.espn.com/watch/",               bg:"#CC0000", text:"#fff", type:"Cable/Stream", streamVia:["Fubo","Sling","YouTube TV","Hulu Live"] },
  "ESPN+":             { url:"https://plus.espn.com/",                    bg:"#CC0000", text:"#fff", type:"Streaming",    streamVia:[] },
  "ESPN2":             { url:"https://www.espn.com/watch/",               bg:"#CC0000", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling","YouTube TV","Hulu Live"] },
  "ESPNU":             { url:"https://www.espn.com/watch/",               bg:"#CC0000", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling","YouTube TV","Hulu Live"] },
  "ABC":               { url:"https://abc.com/watch-live",                bg:"#000080", text:"#fff", type:"Free TV",      streamVia:[] },
  "NBC":               { url:"https://www.nbc.com/live",                  bg:"#c8920a", text:"#fff", type:"Free TV",      streamVia:["Peacock","YouTube TV","Hulu Live"] },
  "Peacock":           { url:"https://www.peacocktv.com/",                bg:"#1a1a1a", text:"#fff", type:"Streaming",    streamVia:[] },
  "FOX":               { url:"https://www.fox.com/live/",                 bg:"#003366", text:"#fff", type:"Free TV",      streamVia:[] },
  "FS1":               { url:"https://www.foxsports.com/live",            bg:"#003366", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling","YouTube TV","Hulu Live"] },
  "FS2":               { url:"https://www.foxsports.com/live",            bg:"#003366", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling"] },
  "CBS":               { url:"https://www.cbssports.com/live/",           bg:"#003DA5", text:"#fff", type:"Free TV",      streamVia:[] },
  "Paramount+":        { url:"https://www.paramountplus.com/",            bg:"#0064FF", text:"#fff", type:"Streaming",    streamVia:[] },
  "TNT":               { url:"https://www.tntdrama.com/watchtnt",         bg:"#E03A3E", text:"#fff", type:"Cable",        streamVia:["Sling","YouTube TV","Hulu Live"] },
  "TBS":               { url:"https://www.tbs.com/watchtbs",              bg:"#FF6600", text:"#fff", type:"Cable",        streamVia:["Sling","YouTube TV","Hulu Live"] },
  "truTV":             { url:"https://www.trutv.com/",                    bg:"#E03A3E", text:"#fff", type:"Cable",        streamVia:["Sling","YouTube TV","Hulu Live"] },
  "Apple TV+":         { url:"https://tv.apple.com/",                     bg:"#333",    text:"#fff", type:"Streaming",    streamVia:[] },
  "Prime Video":       { url:"https://www.amazon.com/primevideo",         bg:"#00A8E0", text:"#fff", type:"Streaming",    streamVia:[] },
  "Max":               { url:"https://www.max.com/",                      bg:"#002BE7", text:"#fff", type:"Streaming",    streamVia:[] },
  "Univision":         { url:"https://www.univision.com/",                bg:"#FF6600", text:"#fff", type:"Free TV",      streamVia:[] },
  "Universo":          { url:"https://www.nbc.com/networks/nbc-universo", bg:"#8B0D8B", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling"] },
  "TUDN":              { url:"https://www.tudn.com/",                     bg:"#CC0000", text:"#fff", type:"Cable/Stream", streamVia:["Fubo","Sling"] },
  "USA Network":       { url:"https://www.usanetwork.com/live",           bg:"#003DA5", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling"] },
  "NFL Network":       { url:"https://www.nfl.com/network/watch",         bg:"#013369", text:"#fff", type:"Cable",        streamVia:["Fubo","DirecTV"] },
  "NBA TV":            { url:"https://www.nba.com/watch",                 bg:"#C9082A", text:"#fff", type:"Cable/Stream", streamVia:["Fubo","Sling"] },
  "CBS Sports Network":{ url:"https://www.cbssports.com/live/",           bg:"#003DA5", text:"#fff", type:"Cable",        streamVia:["Fubo","Sling"] },
  "beIN SPORTS":       { url:"https://www.beinsports.com/us/",            bg:"#8B0000", text:"#fff", type:"Cable/Stream", streamVia:["Fubo","Sling"] },
};

const BROADCASTER_ALIASES = {
  "USA Net":"USA Network","USA NET":"USA Network","USANET":"USA Network",
  "ESPN Deportes":"ESPN","ESPND":"ESPN",
  "FS 1":"FS1","FS 2":"FS2","Fox Sports 1":"FS1","Fox Sports 2":"FS2",
  "NBATV":"NBA TV","CBSSN":"CBS Sports Network",
  "Paramount Plus":"Paramount+","Apple TV Plus":"Apple TV+",
  "Prime":"Prime Video","Amazon":"Prime Video","UNIVERSO":"Universo",
};

const LEAGUE_FALLBACK = {
  epl:      [{ name:"Peacock", note:"Most Premier League matches on Peacock" }, { name:"USA Network", note:"Select matches on USA Network — stream via Fubo or Sling" }],
  ucl:      [{ name:"Paramount+", note:"Champions League on Paramount+" }, { name:"CBS", note:"Select marquee matches on CBS" }],
  seriea:   [{ name:"Paramount+", note:"Serie A on Paramount+" }, { name:"CBS Sports Network", note:"Select on CBS Sports Network" }],
  laliga:   [{ name:"ESPN+", note:"La Liga exclusively on ESPN+" }],
  worldcup: [{ name:"FOX", note:"World Cup on FOX (free over-the-air)" }, { name:"FS1", note:"Additional matches on FS1" }, { name:"Univision", note:"Spanish broadcast on Univision" }],
  mls:      [{ name:"Apple TV+", note:"MLS Season Pass on Apple TV+" }, { name:"ESPN+", note:"Select matches on ESPN+" }],
  nfl:      [{ name:"NFL Network", note:"Check NFL Network — also on Fubo & DirecTV" }],
  nba:      [{ name:"NBA TV", note:"Check NBA TV — also on Fubo & Sling" }],
};

const STATUS_MAP = {
  "STATUS_SCHEDULED":   { label:"Upcoming", live:false, final:false },
  "STATUS_IN_PROGRESS": { label:"LIVE",     live:true,  final:false },
  "STATUS_HALFTIME":    { label:"Halftime", live:true,  final:false },
  "STATUS_END_PERIOD":  { label:"Break",    live:true,  final:false },
  "STATUS_FINAL":       { label:"Final",    live:false, final:true  },
  "STATUS_FULL_TIME":   { label:"Final",    live:false, final:true  },
  "STATUS_POSTPONED":   { label:"Postponed",live:false, final:false },
  "STATUS_CANCELED":    { label:"Canceled", live:false, final:false },
};

function resolveBC(name) { return BROADCASTER_ALIASES[name?.trim()]||name?.trim(); }
function parseBroadcasters(arr) {
  if (!arr?.length) return [];
  return [...new Set(arr.flatMap(b=>b.names||[b.name||b.shortName||""]).map(n=>resolveBC(n)).filter(Boolean))];
}
function todayStr() {
  const d=new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}
function offsetStr(days) {
  const d=new Date(); d.setDate(d.getDate()+days);
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}
function formatTime(dateStr) {
  if (!dateStr) return "TBD";
  return new Date(dateStr).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZoneName:"short"});
}
function formatDayHeader(dateStr) {
  const d=new Date(dateStr),t=new Date(),tm=new Date(t);
  t.setHours(0,0,0,0); tm.setDate(t.getDate()+1);
  const gd=new Date(d); gd.setHours(0,0,0,0);
  if (gd.getTime()===t.getTime()) return "Today";
  if (gd.getTime()===tm.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});
}
function isLiveStatus(n) {
  if (!n) return false;
  if (n==="STATUS_IN_PROGRESS"||n==="STATUS_HALFTIME"||n==="STATUS_END_PERIOD") return true;
  const u=n.toUpperCase();
  return u.includes("PROGRESS")||u.includes("HALFTIME")||u.includes("OVERTIME")||u.includes("ACTIVE")||u.includes("LIVE");
}

// ── UI Components ─────────────────────────────────────────────────────────────

function LiveDot({ large }) {
  return <span style={{ display:"inline-block",width:large?9:7,height:large?9:7,borderRadius:"50%",background:"#ff3b3b",marginRight:large?7:5,animation:"pulse 1.2s ease-in-out infinite",flexShrink:0 }} />;
}

function BroadcasterPill({ name, small }) {
  const info=BROADCASTER_MAP[name]||{bg:"#2a2f3f",text:"#fff"};
  return <span style={{ background:info.bg,color:info.text,fontSize:small?"10px":"11px",fontWeight:700,padding:small?"2px 7px":"3px 9px",borderRadius:4,letterSpacing:"0.4px",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif" }}>{name}</span>;
}

function TeamBlock({ competitor, showScore, reverse }) {
  const team=competitor?.team||{};
  const winner=competitor?.winner;
  return (
    <div style={{ display:"flex",flexDirection:reverse?"row-reverse":"row",alignItems:"center",gap:10,flex:1,minWidth:0 }}>
      {team.logo
        ? <img src={team.logo} alt={team.abbreviation||""} style={{ width:36,height:36,objectFit:"contain",flexShrink:0 }} onError={e=>e.target.style.display="none"} />
        : <div style={{ width:36,height:36,borderRadius:"50%",background:"#1e2535",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#8898aa",flexShrink:0 }}>{(team.abbreviation||"?").slice(0,3)}</div>
      }
      <div style={{ minWidth:0,textAlign:reverse?"right":"left" }}>
        <div style={{ fontSize:14,fontWeight:winner?700:400,color:winner?"#f0f0f0":"#8898aa",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
          {team.shortDisplayName||team.displayName||"TBD"}
        </div>
        {showScore&&competitor?.score!==undefined&&
          <div style={{ fontSize:22,fontWeight:800,color:winner?"#f0f0f0":"#555e70",lineHeight:1.1,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px" }}>{competitor.score}</div>
        }
      </div>
    </div>
  );
}

function GameCard({ game, sport, onClick }) {
  const comp=game.competitions?.[0];
  const home=comp?.competitors?.find(c=>c.homeAway==="home");
  const away=comp?.competitors?.find(c=>c.homeAway==="away");
  const statusName=game.status?.type?.name||"";
  const statusInfo=STATUS_MAP[statusName]||{label:game.status?.type?.shortDetail||"Scheduled",live:false,final:false};
  const period=game.status?.type?.shortDetail||"";
  const broadcasters=parseBroadcasters(comp?.broadcasts||[]);
  const isLive=statusInfo.live;
  const gameSport=game._sport||sport;

  return (
    <div className={`card-hover${isLive?" card-live":""}`} onClick={onClick}
      style={{ background:isLive?"linear-gradient(135deg,#0f1420 0%,#1a0a0a 100%)":"#0f1420", border:`1px solid ${isLive?"rgba(255,59,59,0.45)":"#1e2535"}`, borderRadius:16, padding:"16px 18px", display:"flex", flexDirection:"column", gap:12, animation:"fadeUp 0.3s ease both", position:"relative", overflow:"hidden" }}>
      {isLive&&<div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ff3b3b,#ff6b6b,#ff3b3b)",backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite" }} />}

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          {/* Show league badge when in All Sports view */}
          {game._sport&&<span style={{ fontSize:10,fontWeight:700,color:gameSport.accent||"#63b3ed",textTransform:"uppercase",letterSpacing:"0.8px" }}>{gameSport.emoji} {gameSport.label}</span>}
          {!game._sport&&<span style={{ fontSize:12,color:"#5a6478" }}>{isLive?period:formatTime(game.date)}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
          {game._sport&&<span style={{ fontSize:11,color:"#5a6478" }}>{isLive?period:formatTime(game.date)}</span>}
          <span style={{ display:"flex",alignItems:"center",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,background:isLive?"rgba(255,59,59,0.15)":statusInfo.final?"#1a1f2e":"#141820",color:isLive?"#ff6b6b":statusInfo.final?"#5a6478":"#63b3ed",letterSpacing:"0.5px",textTransform:"uppercase" }}>
            {isLive&&<LiveDot />}{statusInfo.label}
          </span>
        </div>
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <TeamBlock competitor={away} showScore={isLive||statusInfo.final} />
        <span style={{ fontSize:11,color:"#2a3040",fontWeight:700,flexShrink:0 }}>VS</span>
        <TeamBlock competitor={home} showScore={isLive||statusInfo.final} reverse />
      </div>

      {broadcasters.length>0&&
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",paddingTop:4,borderTop:"1px solid #141820" }}>
          {broadcasters.slice(0,3).map(b=><BroadcasterPill key={b} name={b} small />)}
        </div>
      }
    </div>
  );
}

function SkeletonCard() { return <div className="skeleton" style={{ height:118 }} />; }

// ── Game Detail ───────────────────────────────────────────────────────────────

function GameDetail({ game, sport, onClose }) {
  const startY=useRef(null);
  const comp=game.competitions?.[0];
  const home=comp?.competitors?.find(c=>c.homeAway==="home");
  const away=comp?.competitors?.find(c=>c.homeAway==="away");
  const statusName=game.status?.type?.name||"";
  const statusInfo=STATUS_MAP[statusName]||{label:"Scheduled",live:false,final:false};
  const period=game.status?.type?.shortDetail||"";
  const venue=comp?.venue;
  const note=comp?.notes?.[0]?.headline||"";
  const rawBC=parseBroadcasters(comp?.broadcasts||[]);
  const allBC=rawBC.length>0?rawBC.map(name=>({name,note:null})):(LEAGUE_FALLBACK[sport.id]||[]);

  const onTouchStart=e=>{ startY.current=e.touches[0].clientY; };
  const onTouchEnd=e=>{ if(startY.current===null)return; if(e.changedTouches[0].clientY-startY.current>80)onClose(); startY.current=null; };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e=>e.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:-10,marginTop:-8 }}>
          <div style={{ width:36,height:4,borderRadius:4,background:"#2a2f3f" }} />
        </div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:12,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:sport.accent||"#63b3ed",marginBottom:4 }}>{sport.emoji} {sport.label}</div>
            {note&&<div style={{ fontSize:12,color:"#5a6478" }}>{note}</div>}
          </div>
          <button onClick={onClose} style={{ background:"#141820",border:"1px solid #1e2535",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#8898aa",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>✕</button>
        </div>

        <div style={{ background:"#141820",borderRadius:16,padding:"20px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,border:statusInfo.live?"1px solid rgba(255,59,59,0.3)":"1px solid transparent",position:"relative",overflow:"hidden" }}>
          {statusInfo.live&&<div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#ff3b3b,#ff6b6b,#ff3b3b)",backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite" }} />}
          <TeamBlock competitor={away} showScore={statusInfo.live||statusInfo.final} />
          <div style={{ textAlign:"center",flexShrink:0 }}>
            {(statusInfo.live||statusInfo.final)
              ? <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:40,fontWeight:800,color:"#f0f0f0",fontFamily:"'Bebas Neue',sans-serif" }}>{away?.score??0}</span>
                  <span style={{ fontSize:14,color:"#2a3040" }}>–</span>
                  <span style={{ fontSize:40,fontWeight:800,color:"#f0f0f0",fontFamily:"'Bebas Neue',sans-serif" }}>{home?.score??0}</span>
                </div>
              : <div style={{ fontSize:13,color:"#8898aa",fontWeight:600 }}>{formatTime(game.date)}</div>
            }
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",color:statusInfo.live?"#ff6b6b":"#5a6478",marginTop:4 }}>
              {statusInfo.live&&<LiveDot />}{statusInfo.live?period:statusInfo.label}
            </div>
          </div>
          <TeamBlock competitor={home} showScore={statusInfo.live||statusInfo.final} reverse />
        </div>

        {venue?.fullName&&<div style={{ fontSize:13,color:"#5a6478",textAlign:"center" }}>📍 {venue.fullName}{venue.address?.city?`, ${venue.address.city}`:""}</div>}

        <div>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",color:"#5a6478",marginBottom:14 }}>Where to Watch</div>
          {allBC.length===0
            ? <div style={{ fontSize:14,color:"#5a6478",padding:16,background:"#141820",borderRadius:12,textAlign:"center" }}>Broadcast info not yet available — check back closer to game time.</div>
            : <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {allBC.map(({name,note:bn},i)=>{
                  const info=BROADCASTER_MAP[name]||{bg:"#2a2f3f",text:"#fff",url:null,type:"Unknown",streamVia:[]};
                  const alts=info.streamVia||[];
                  return (
                    <div key={i} style={{ padding:"14px 16px",background:"#141820",border:"1px solid #1e2535",borderRadius:12,display:"flex",flexDirection:"column",gap:10 }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
                        <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                            <BroadcasterPill name={name} />
                            <span style={{ fontSize:10,fontWeight:600,color:"#5a6478",background:"#1e2535",padding:"2px 7px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.5px" }}>{info.type}</span>
                          </div>
                          {bn&&<div style={{ fontSize:12,color:"#5a6478" }}>{bn}</div>}
                        </div>
                        {info.url&&<a href={info.url} target="_blank" rel="noreferrer" className="watch-btn" style={{ display:"inline-flex",alignItems:"center",background:info.bg,color:info.text,fontSize:13,fontWeight:700,padding:"8px 16px",borderRadius:8,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0,fontFamily:"'DM Sans',sans-serif" }}>Watch →</a>}
                      </div>
                      {alts.length>0&&
                        <div style={{ paddingTop:10,borderTop:"1px solid #1e2535",display:"flex",flexDirection:"column",gap:6 }}>
                          <div style={{ fontSize:10,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase",color:"#3a4255" }}>No cable? Stream via</div>
                          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                            {alts.map(altName=>{ const alt=STREAMING_ALTS[altName]; if(!alt)return null; return <a key={altName} href={alt.url} target="_blank" rel="noreferrer" className="watch-btn" style={{ background:alt.bg,color:alt.text,fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:6,textDecoration:"none",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif" }}>{altName}</a>; })}
                          </div>
                        </div>
                      }
                    </div>
                  );
                })}
              </div>
          }
        </div>
        <div style={{ fontSize:11,color:"#3a4255",textAlign:"center",lineHeight:1.6,paddingTop:4,borderTop:"1px solid #141820" }}>
          📡 Broadcast info sourced from ESPN's data feed. Listings may vary — always confirm with your provider, especially for soccer.
        </div>
      </div>
    </div>
  );
}

// ── All Sports Homepage View ───────────────────────────────────────────────────

function AllSportsView({ liveGames, loading, onGameClick }) {
  if (loading) {
    return (
      <div style={{ display:"flex",flexDirection:"column",gap:32 }}>
        <div>
          <div style={{ fontSize:13,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"#5a6478",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #141820" }}>
            Checking for live games…
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
            {[1,2,3,4,5,6].map(i=><SkeletonCard key={i}/>)}
          </div>
        </div>
      </div>
    );
  }

  if (liveGames.length===0) {
    return (
      <div style={{ textAlign:"center",padding:"80px 20px" }}>
        <div style={{ fontSize:52,marginBottom:16 }}>📺</div>
        <div style={{ fontSize:24,fontWeight:700,color:"#f0f0f0",marginBottom:10,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px" }}>
          No Games Live Right Now
        </div>
        <div style={{ fontSize:15,color:"#5a6478",maxWidth:360,margin:"0 auto",lineHeight:1.7 }}>
          Pick a sport above to browse today's schedule and upcoming games.
        </div>
      </div>
    );
  }

  // Group live games by sport
  const grouped = {};
  liveGames.forEach(g=>{
    const sid=g._sport?.id||"other";
    if (!grouped[sid]) grouped[sid]=[];
    grouped[sid].push(g);
  });

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:32 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:-16 }}>
        <LiveDot large />
        <span style={{ fontSize:13,fontWeight:700,color:"#ff6b6b",letterSpacing:"1px",textTransform:"uppercase" }}>
          {liveGames.length} Game{liveGames.length!==1?"s":""} Live Now
        </span>
      </div>
      {Object.entries(grouped).map(([sid,games])=>{
        const sport=SPORTS.find(s=>s.id===sid);
        return (
          <div key={sid}>
            <div style={{ fontSize:13,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:sport?.accent||"#5a6478",marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${sport?.accent||"#141820"}22` }}>
              {sport?.emoji} {sport?.label}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
              {games.map(g=><GameCard key={g.id} game={g} sport={sport} onClick={()=>onGameClick(g,sport,false)} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ borderTop:"1px solid #141820",padding:"24px 20px",textAlign:"center",marginTop:40 }}>
      <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",flexDirection:"column",gap:6,alignItems:"center" }}>
        <div style={{ fontSize:13,fontWeight:700,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"2px",color:"#3a4255" }}>⚡ SPORTZONE</div>
        <div style={{ fontSize:11,color:"#2a3040",maxWidth:480,lineHeight:1.7 }}>
          Broadcast info is sourced from ESPN's public data feed and provided for informational purposes only. Listings may differ from what actually airs — always confirm with your provider or streaming service, especially for international soccer. SportZone is not affiliated with ESPN or any broadcaster.
        </div>
        <div style={{ fontSize:11,color:"#2a3040",marginTop:4 }}>© {new Date().getFullYear()} SportZone</div>
      </div>
    </footer>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

const REFRESH_MS = 45000;

export default function SportZone() {
  const [activeSport,   setActiveSport]   = useState(ALL_SPORTS_ID);
  const [allGames,      setAllGames]      = useState({});
  const [liveGames,     setLiveGames]     = useState([]);
  const [loadingLive,   setLoadingLive]   = useState(true);
  const [loading,       setLoading]       = useState(false);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState(null);
  const [activeDay,     setActiveDay]     = useState("today");
  const [selectedGame,  setSelectedGame]  = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);
  const [lastUpdated,   setLastUpdated]   = useState(null);
  const [tsKey,         setTsKey]         = useState(0);
  const timerRef = useRef(null);

  const fetchDay = useCallback(async (sport, dateStr) => {
    // Today: no date param so ESPN returns live statuses correctly
    const isToday = dateStr === offsetStr(0);
    const url = isToday
      ? `https://site.api.espn.com/apis/site/v2/sports/${sport.sport}/${sport.league}/scoreboard?limit=100`
      : `https://site.api.espn.com/apis/site/v2/sports/${sport.sport}/${sport.league}/scoreboard?dates=${dateStr}&limit=100`;
    const res=await fetch(url); if(!res.ok) throw new Error("fail");
    return (await res.json()).events||[];
  },[]);

  const fetchAllDays = useCallback(async (sport, silent=false) => {
    if (!silent) { setLoading(true); setError(null); }
    else setRefreshing(true);
    try {
      const dates=[0,1,2,3,4,5,6].map(i=>offsetStr(i));
      const results=await Promise.all(dates.map(d=>fetchDay(sport,d)));
      const grouped={};
      results.forEach((evts,i)=>{ if(evts.length>0) grouped[dates[i]]=evts; });
      setAllGames(grouped);
      setLastUpdated(new Date());
      setTsKey(k=>k+1);
    } catch(e) {
      if (!silent) setError("Could not load games. Check your connection and try again.");
    }
    if (!silent) setLoading(false);
    else setRefreshing(false);
  },[fetchDay]);

  const fetchLiveAll = useCallback(async (isFirst=false) => {
    if (isFirst) setLoadingLive(true);
    try {
      const results=await Promise.all(SPORTS.map(async sport=>{
        // No date param = ESPN returns truly current live state
        const url=`https://site.api.espn.com/apis/site/v2/sports/${sport.sport}/${sport.league}/scoreboard?limit=100`;
        const res=await fetch(url); if(!res.ok) return [];
        const data=await res.json();
        const events=data.events||[];
        // Check both status name and completed flag
        const live=events.filter(g=>{
          const s=g.status?.type?.name||'';
          const completed=g.status?.type?.completed===true;
          if (completed) return false;
          if (isLiveStatus(s)) return true;
          // Also check if clock is running (period > 0 and not completed)
          const period=g.status?.period||0;
          const clock=g.status?.displayClock||'';
          return period>0 && clock!=='' && clock!=='0:00' && !completed;
        });
        return live.map(g=>({...g,_sport:sport}));
      }));
      const live=results.flat();
      setLiveGames(live);
      if (isFirst&&live.length===0) setTimeout(()=>fetchLiveAll(false),8000);
    } catch(e) {}
    if (isFirst) setLoadingLive(false);
  },[]);

  useEffect(()=>{
    if (activeSport!==ALL_SPORTS_ID) {
      const sport=SPORTS.find(s=>s.id===activeSport);
      if (sport) fetchAllDays(sport);
      localStorage.setItem("sz_sport", activeSport);
    }
  },[activeSport]);

  useEffect(()=>{ fetchLiveAll(true); },[]);

  useEffect(()=>{
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      fetchLiveAll(false);
      if (activeSport!==ALL_SPORTS_ID) {
        const sport=SPORTS.find(s=>s.id===activeSport);
        if (sport) fetchAllDays(sport,true);
      }
    }, REFRESH_MS);
    return ()=>clearInterval(timerRef.current);
  },[activeSport]);

  const handleRefresh = () => {
    fetchLiveAll(false);
    if (activeSport!==ALL_SPORTS_ID) {
      const sport=SPORTS.find(s=>s.id===activeSport);
      if (sport) fetchAllDays(sport,false);
    }
  };

  // Called from AllSportsView quick-pick buttons or live card clicks
  const handleAllSportsGameClick = (game, sport, switchTab) => {
    if (switchTab) {
      setActiveSport(sport.id);
      setActiveDay("today");
    } else {
      setSelectedGame(game);
      setSelectedSport(sport);
    }
  };

  const openGame = (game, sport) => { setSelectedGame(game); setSelectedSport(sport); };

  const currentSport = SPORTS.find(s=>s.id===activeSport);
  const today        = todayStr();
  const tomorrow     = offsetStr(1);
  const todayGames   = allGames[today]   ||[];
  const tomorrowGames= allGames[tomorrow]||[];
  const weekEntries  = Object.entries(allGames).filter(([k])=>k!==today&&k!==tomorrow);
  const weekCount    = weekEntries.reduce((a,[,v])=>a+v.length,0);
  const displayGames = activeDay==="today"?todayGames:activeDay==="tomorrow"?tomorrowGames:[];

  const tabs=[
    {key:"today",    label:"Today",    count:todayGames.length},
    {key:"tomorrow", label:"Tomorrow", count:tomorrowGames.length},
    {key:"week",     label:"This Week",count:weekCount},
  ];

  return (
    <>
      <style>{FONTS}{GLOBAL_STYLES}</style>

      {/* ── Header ── */}
      <div style={{ background:"rgba(8,11,18,0.96)",borderBottom:"1px solid #141820",position:"sticky",top:0,zIndex:100,backdropFilter:"blur(14px)" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 20px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0 9px" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10, cursor:"pointer" }} onClick={()=>{setActiveSport(ALL_SPORTS_ID);}}>
              <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#63b3ed,#3182ce)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>⚡</div>
              <span style={{ fontSize:26,fontWeight:800,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"2px",color:"#f0f0f0" }}>SportZone</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              {lastUpdated&&<span key={tsKey} className="timestamp-flash header-timestamp" style={{ fontSize:11,color:"#3a4255" }}>Updated {lastUpdated.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}</span>}
              <button className="refresh-btn" onClick={handleRefresh} title="Refresh"
                style={{ background:"#141820",border:"1px solid #1e2535",borderRadius:8,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",color:"#8898aa",flexShrink:0 }}>
                <svg className={refreshing?"spinning":""} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
                </svg>
              </button>
              <span className="header-date" style={{ fontSize:12,color:"#5a6478",fontWeight:500 }}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span>
            </div>
          </div>

          {/* Sport tabs with All Sports first */}
          <div className="tabs-wrap">
            {/* All Sports tab */}
            <button className="sport-btn"
              onClick={()=>setActiveSport(ALL_SPORTS_ID)}
              style={{ background:activeSport===ALL_SPORTS_ID?"rgba(99,179,237,0.1)":"none",border:"none",padding:"8px 12px",borderRadius:"8px 8px 0 0",fontSize:13,fontWeight:activeSport===ALL_SPORTS_ID?700:500,color:activeSport===ALL_SPORTS_ID?"#63b3ed":"#5a6478",whiteSpace:"nowrap",borderBottom:activeSport===ALL_SPORTS_ID?"2px solid #63b3ed":"2px solid transparent",fontFamily:"'DM Sans',sans-serif",position:"relative" }}>
              🏟️ <span className="sport-btn-label">All Sports</span>
              {liveGames.length>0&&activeSport!==ALL_SPORTS_ID&&<span style={{ position:"absolute",top:6,right:3,width:6,height:6,borderRadius:"50%",background:"#ff3b3b",animation:"pulse 1.2s ease-in-out infinite" }} />}
            </button>

            {SPORTS.map(s=>{
              const active=activeSport===s.id;
              const hasLiveNow=liveGames.some(g=>g._sport?.id===s.id);
              return (
                <button key={s.id} className="sport-btn"
                  onClick={()=>{ setActiveSport(s.id); setActiveDay("today"); }}
                  style={{ background:active?"rgba(99,179,237,0.1)":"none",border:"none",padding:"8px 12px",borderRadius:"8px 8px 0 0",fontSize:13,fontWeight:active?700:500,color:active?"#63b3ed":"#5a6478",whiteSpace:"nowrap",borderBottom:active?"2px solid #63b3ed":"2px solid transparent",fontFamily:"'DM Sans',sans-serif",position:"relative" }}>
                  <span>{s.emoji}</span><span className="sport-btn-label"> {s.label}</span>
                  {hasLiveNow&&!active&&<span style={{ position:"absolute",top:6,right:3,width:6,height:6,borderRadius:"50%",background:"#ff3b3b",animation:"pulse 1.2s ease-in-out infinite" }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Hero headline — always visible ── */}
      <div className="hero-section" style={{ padding:"24px 20px 16px",maxWidth:1100,margin:"0 auto",animation:"heroFade 0.5s ease both" }}>
        <h1 className="hero-headline" style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(36px,6.5vw,80px)",letterSpacing:"3px",color:"#f0f0f0",lineHeight:0.93,marginBottom:10 }}>
          Never Miss<br />
          <span style={{ background:"linear-gradient(90deg,#63b3ed,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>The Game</span>
        </h1>
        <p className="hero-tagline" style={{ fontSize:15,color:"#5a6478",maxWidth:440,lineHeight:1.65 }}>
          Every live and upcoming game across NFL, NBA, Premier League and more — with exactly where to watch it in the US.
        </p>
      </div>

      {/* ── Divider ── */}
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 20px" }}>
        <div style={{ borderTop:"1px solid #141820",marginBottom:24 }} />
      </div>

      {/* ── Main content area ── */}
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"0 20px 40px" }}>

        {/* ALL SPORTS view */}
        {activeSport===ALL_SPORTS_ID&&(
          <AllSportsView liveGames={liveGames} loading={loadingLive} onGameClick={handleAllSportsGameClick} />
        )}

        {/* SINGLE SPORT view */}
        {activeSport!==ALL_SPORTS_ID&&(
          <>
            {/* Day tabs */}
            <div className="day-tabs">
              {tabs.map(tab=>{
                const active=activeDay===tab.key;
                return (
                  <button key={tab.key} onClick={()=>setActiveDay(tab.key)}
                    style={{ background:active?"#141820":"none",border:active?"1px solid #1e2535":"1px solid transparent",borderRadius:10,padding:"9px 18px",cursor:"pointer",fontSize:14,fontWeight:active?700:500,color:active?"#f0f0f0":"#5a6478",display:"flex",alignItems:"center",gap:7,fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>
                    {tab.label}
                    <span style={{ background:active?"#63b3ed22":"#1e2535",color:active?"#63b3ed":"#5a6478",fontSize:11,fontWeight:700,borderRadius:20,padding:"1px 8px" }}>
                      {loading&&tab.key!=="week"?"…":tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {loading&&<div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>{[1,2,3,4,5,6].map(i=><SkeletonCard key={i}/>)}</div>}

            {!loading&&error&&
              <div style={{ textAlign:"center",padding:"60px 0" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>⚠️</div>
                <div style={{ fontSize:15,color:"#5a6478",marginBottom:20 }}>{error}</div>
                <button onClick={handleRefresh} style={{ background:"#141820",border:"1px solid #1e2535",borderRadius:10,padding:"10px 24px",cursor:"pointer",color:"#f0f0f0",fontSize:14,fontWeight:600,fontFamily:"'DM Sans',sans-serif" }}>Try Again</button>
              </div>
            }

            {!loading&&!error&&activeDay!=="week"&&displayGames.length===0&&
              <div style={{ textAlign:"center",padding:"70px 0" }}>
                <div style={{ fontSize:48,marginBottom:14 }}>{currentSport?.emoji}</div>
                <div style={{ fontSize:20,fontWeight:700,color:"#f0f0f0",marginBottom:8,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px" }}>
                  No {currentSport?.label} games {activeDay==="today"?"today":"tomorrow"}
                </div>
                <div style={{ fontSize:14,color:"#5a6478" }}>Try checking This Week or switch to another sport.</div>
              </div>
            }

            {!loading&&!error&&activeDay!=="week"&&displayGames.length>0&&
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
                {displayGames.map(g=><GameCard key={g.id} game={g} sport={currentSport} onClick={()=>openGame(g,currentSport)} />)}
              </div>
            }

            {!loading&&!error&&activeDay==="week"&&
              (weekEntries.length===0
                ? <div style={{ textAlign:"center",padding:"70px 0" }}>
                    <div style={{ fontSize:48,marginBottom:14 }}>{currentSport?.emoji}</div>
                    <div style={{ fontSize:20,fontWeight:700,color:"#f0f0f0",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px" }}>No upcoming {currentSport?.label} games this week</div>
                  </div>
                : <div style={{ display:"flex",flexDirection:"column",gap:32 }}>
                    {weekEntries.sort(([a],[b])=>a.localeCompare(b)).map(([key,games])=>(
                      <div key={key}>
                        <div style={{ fontSize:13,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"#5a6478",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #141820" }}>
                          {formatDayHeader(games[0].date)}
                        </div>
                        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14 }}>
                          {games.map(g=><GameCard key={g.id} game={g} sport={currentSport} onClick={()=>openGame(g,currentSport)} />)}
                        </div>
                      </div>
                    ))}
                  </div>
              )
            }
          </>
        )}
      </div>

      <Footer />

      {selectedGame&&<GameDetail game={selectedGame} sport={selectedSport||currentSport||SPORTS[0]} onClose={()=>{ setSelectedGame(null); setSelectedSport(null); }} />}
    </>
  );
}
