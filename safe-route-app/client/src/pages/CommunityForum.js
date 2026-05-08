import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const FORUM_POSTS = [
  {
    id: 1, author: "Priya M.", avatar: "P", city: "Bhopal", time: "2h ago",
    title: "Late night auto ride experience near Kolar Road",
    content: "Took an auto from Kolar Road at 11 PM last night. The driver was cooperative, but the street lighting near Sector C was very poor. I've marked it as unsafe on TRINETRA. Anyone else noticed this?",
    likes: 24, replies: 8, tag: "Route Report"
  },
  {
    id: 2, author: "Anita S.", avatar: "A", city: "Indore", time: "5h ago",
    title: "Best safe routes from Rajiv Gandhi Square to Palasia",
    content: "I've been using TRINETRA for 3 months now and the safest route I found is through Sapna Sangeeta Road. Well-lit, always has traffic, and multiple police checkpoints. Highly recommended for anyone commuting after 9 PM!",
    likes: 43, replies: 12, tag: "Safe Route"
  },
  {
    id: 3, author: "Kavita R.", avatar: "K", city: "Jaipur", time: "1d ago",
    title: "SOS feature saved me — sharing my story",
    content: "Last week I was in a cab and the driver started taking a different route. I immediately shook my phone and TRINETRA sent my live location to my brother and mom. My brother called the driver and he got back on track. This app literally saved me. Thank you team!",
    likes: 156, replies: 34, tag: "Success Story"
  },
  {
    id: 4, author: "Sneha D.", avatar: "S", city: "Delhi", time: "2d ago",
    title: "Feature request: Walk with me (virtual companion)",
    content: "It would be amazing if TRINETRA had a 'Walk With Me' feature where a trusted contact can watch your live location while you walk home, like a virtual companion. They could speak to you through the app and you'd feel safer knowing someone is watching.",
    likes: 89, replies: 21, tag: "Feature Request"
  },
  {
    id: 5, author: "Meera K.", avatar: "M", city: "Bangalore", time: "3d ago",
    title: "Safety tip: Always screenshot your cab details",
    content: "Pro tip for everyone: Before getting into any cab, take a screenshot of the driver's name, photo, vehicle number, and OTP from the app. Share it with a friend. It takes 10 seconds and could save your life. Stay safe everyone! 💪",
    likes: 67, replies: 15, tag: "Safety Tip"
  }
];

const TAG_COLORS = {
  "Route Report": { bg: "rgba(255,140,0,0.1)", color: "#ff8c00", border: "rgba(255,140,0,0.25)" },
  "Safe Route": { bg: "rgba(0,229,160,0.1)", color: "#00e5a0", border: "rgba(0,229,160,0.25)" },
  "Success Story": { bg: "rgba(0,149,255,0.1)", color: "#60b8ff", border: "rgba(0,149,255,0.25)" },
  "Feature Request": { bg: "rgba(168,85,247,0.1)", color: "#a855f7", border: "rgba(168,85,247,0.25)" },
  "Safety Tip": { bg: "rgba(251,191,36,0.1)", color: "#fbbc04", border: "rgba(251,191,36,0.25)" },
};

export default function CommunityForum() {
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="nr-root" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="nr-topbar" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <span style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>TRINETRA</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Community Forum</span>
        </div>
        <Link to="/" style={{ textDecoration: "none", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>← Home</Link>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Community</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>Safety Forum</h1>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7 }}>Share experiences, report unsafe areas, and help other women stay safe across India.</p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap"
        }}>
          {[
            { num: "2.4K", label: "Members" },
            { num: "856", label: "Posts" },
            { num: "127", label: "Unsafe Areas Reported" },
            { num: "45", label: "Cities" },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, minWidth: 120, padding: "16px", textAlign: "center",
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 14,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "'JetBrains Mono',monospace" }}>{s.num}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Posts */}
        {FORUM_POSTS.map(post => {
          const tagStyle = TAG_COLORS[post.tag] || TAG_COLORS["Safety Tip"];
          return (
            <div key={post.id} style={{
              background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 18,
              padding: "24px", marginBottom: 16, transition: "all .3s",
            }}>
              {/* Author row */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), #0095ff)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: "#0a0c10"
                }}>{post.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{post.author}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{post.city} · {post.time}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 50,
                  background: tagStyle.bg, color: tagStyle.color, border: `1px solid ${tagStyle.border}`,
                  textTransform: "uppercase", letterSpacing: "0.04em"
                }}>{post.tag}</span>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>{post.title}</h3>
              <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.75, marginBottom: 16 }}>{post.content}</p>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <button onClick={() => toggleLike(post.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                  color: liked[post.id] ? "var(--accent)" : "var(--text3)", cursor: "pointer", fontSize: 13,
                  fontFamily: "inherit", fontWeight: 600, transition: "color .2s"
                }}>
                  {liked[post.id] ? "💚" : "🤍"} {post.likes + (liked[post.id] ? 1 : 0)}
                </button>
                <span style={{ fontSize: 13, color: "var(--text3)" }}>💬 {post.replies} replies</span>
              </div>
            </div>
          );
        })}

        {/* Write a post */}
        <div style={{
          background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)", borderRadius: 16,
          padding: "24px", textAlign: "center", marginTop: 24
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Have something to share?</p>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>Share your experience, report an unsafe area, or help other women with safety tips.</p>
        </div>
      </main>
    </div>
  );
}
