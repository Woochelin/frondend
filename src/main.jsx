import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Star,
  ChevronRight,
  MessageSquare,
  Edit3,
  User,
  Send,
  X,
  Home,
  MessageCircle,
  Crown,
  Trash2,
  Lock,
  Edit2,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import "./styles.css";

const PRIMARY = "#40A8A8";
const PRIMARY_LIGHT = "#E8F5F5";

const PART_TO_TRACK = {
  BACKEND: "BE",
  FRONTEND: "FE",
  ANDROID: "AOS",
  COMMON: "CT",
  SOFT_SKILL: "Soft",
};

const TRACK_TO_PART = {
  BE: "BACKEND",
  FE: "FRONTEND",
  AOS: "ANDROID",
  CT: "COMMON",
  Soft: "SOFT_SKILL",
};

const TYPE_CONFIG = {
  coach: {
    label: "코치",
    api: "/api/v1/coaches",
    color: PRIMARY,
    light: PRIMARY_LIGHT,
  },
  reviewer: {
    label: "리뷰어",
    api: "/api/v1/reviewers",
    color: "#FF8A65",
    light: "#FFEBEE",
  },
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (response.status === 204) {
    return null;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || "요청 처리에 실패했습니다.");
  }
  return body;
}

function normalizeListItem(item, type) {
  return {
    id: item.id ?? item.targetId,
    type,
    targetType: type === "coach" ? "COACH" : "REVIEWER",
    name: item.name ?? item.targetName ?? "",
    track: PART_TO_TRACK[item.part] ?? item.part ?? "",
    part: item.part,
    rating: Number(item.averageRating ?? item.rating ?? 0),
    style: item.style ?? "",
    tags: (item.topTags ?? item.tags ?? []).map(
      (tag) => tag.name ?? String(tag),
    ),
    image: item.profileImageUrl ?? item.image ?? "",
    slackUrl: item.slackUrl ?? "",
    oneOnOneUrl: item.oneOnOneUrl ?? "",
    oneOnOneQuestionUrl: item.oneOnOneQuestionUrl ?? "",
    botId: item.botId ?? "",
    botDescription: item.botDescription ?? "",
  };
}

function normalizeDetail(detail, type) {
  const item = normalizeListItem(detail, type);
  return {
    ...item,
    reviews: (detail.reviews ?? []).map((review) => ({
      id: review.id,
      targetId: item.id,
      type,
      author: review.nickname || "익명의크루",
      content: review.content,
      date: formatDate(review.createdAt),
      rating: Number(review.rating ?? 0),
      tags: (review.tags ?? []).map((tag) => `#${tag.name ?? tag}`),
    })),
  };
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function FallbackImage({ src, alt, className }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 ${className}`}
        style={{
          borderRadius: className.includes("rounded-full")
            ? "9999px"
            : "inherit",
        }}
      >
        <ImageIcon
          size={className.includes("w-14") ? 16 : 32}
          className="mb-2 opacity-50"
        />
        <span
          className={`${className.includes("w-14") ? "text-xs" : "text-xl"} font-baemin text-gray-500`}
        >
          {alt}
        </span>
        {!className.includes("w-14") && (
          <span className="text-xs font-body mt-1">(로컬 확인)</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
    />
  );
}

function PlanetLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M75 15 L78 22 L85 23 L80 28 L82 35 L75 31 L68 35 L70 28 L65 23 L72 22 Z"
        fill="white"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="12"
        transform="rotate(-15 50 50)"
        stroke="currentColor"
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="white"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M 12 58 A 40 12 0 0 0 88 38"
        transform="rotate(-15 50 50)"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="42" cy="44" r="2" fill="currentColor" />
      <circle cx="56" cy="44" r="2" fill="currentColor" />
      <circle cx="49" cy="54" r="2" fill="currentColor" />
      <path
        d="M42 77 Q40 88 45 92"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M55 75 Q62 85 68 83"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function CoachPlanet({ className = "w-12 h-12" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="50"
        cy="55"
        rx="35"
        ry="10"
        transform="rotate(-15 50 55)"
        stroke="#40A8A8"
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="55"
        r="25"
        fill="#E8F5F5"
        stroke="#40A8A8"
        strokeWidth="4"
      />
      <path
        d="M 16 63 A 35 10 0 0 0 84 45"
        transform="rotate(-15 50 55)"
        stroke="#40A8A8"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="43" cy="50" r="2" fill="#40A8A8" />
      <circle cx="57" cy="50" r="2" fill="#40A8A8" />
      <circle cx="50" cy="58" r="2" fill="#40A8A8" />
      <path
        d="M43 80 Q41 90 46 94"
        stroke="#40A8A8"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 78 Q63 88 69 86"
        stroke="#40A8A8"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M50 15 L25 25 L50 35 L75 25 Z" fill="#40A8A8" />
      <path
        d="M35 29 L35 40 Q50 45 65 40 L65 29"
        fill="none"
        stroke="#40A8A8"
        strokeWidth="4"
      />
      <path d="M72 26 L72 40" stroke="#40A8A8" strokeWidth="2" />
      <circle cx="72" cy="42" r="2" fill="#40A8A8" />
    </svg>
  );
}

function ReviewerPlanet({ className = "w-12 h-12" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="50"
        cy="50"
        rx="35"
        ry="10"
        transform="rotate(-15 50 50)"
        stroke="#FF8A65"
        strokeWidth="4"
      />
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="#FFEBEE"
        stroke="#FF8A65"
        strokeWidth="4"
      />
      <path
        d="M 16 58 A 35 10 0 0 0 84 40"
        transform="rotate(-15 50 50)"
        stroke="#FF8A65"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="43" cy="45" r="2" fill="#FF8A65" />
      <circle cx="57" cy="45" r="2" fill="#FF8A65" />
      <circle cx="50" cy="53" r="2" fill="#FF8A65" />
      <path
        d="M43 75 Q41 85 46 89"
        stroke="#FF8A65"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 73 Q63 83 69 81"
        stroke="#FF8A65"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="75"
        cy="30"
        r="10"
        fill="white"
        stroke="#FF8A65"
        strokeWidth="3"
      />
      <path
        d="M68 37 L58 47"
        stroke="#FF8A65"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StarRating({ rating, size = 18 }) {
  const value = Number(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={index < Math.floor(value) ? "fill-current" : ""}
          style={{ color: index < Math.floor(value) ? "#FFC107" : "#E5E7EB" }}
        />
      ))}
      <span className="ml-1 text-sm font-bold text-gray-700">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function TrackBadge({ track }) {
  const colors = {
    BE: "bg-blue-100 text-blue-700 border-blue-200",
    FE: "bg-yellow-100 text-yellow-700 border-yellow-200",
    AOS: "bg-green-100 text-green-700 border-green-200",
    CT: "bg-purple-100 text-purple-700 border-purple-200",
    Soft: "bg-pink-100 text-pink-700 border-pink-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[track] || "bg-gray-100 text-gray-800"}`}
    >
      {track}
    </span>
  );
}

function Header({ currentView, navigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("home")}
        >
          <PlanetLogo className="w-9 h-9 text-[#40A8A8] transform group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-2xl font-baemin text-gray-900 group-hover:text-[#40A8A8] transition-colors mt-1">
            우슐랭가이드
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-base font-bold text-gray-600 font-body">
          <button
            onClick={() => navigate("coaches")}
            className={`hover:text-[#40A8A8] transition-colors ${currentView === "coaches" ? "text-[#40A8A8]" : ""}`}
          >
            코치
          </button>
          <button
            onClick={() => navigate("reviewers")}
            className={`hover:text-[#40A8A8] transition-colors ${currentView === "reviewers" ? "text-[#40A8A8]" : ""}`}
          >
            리뷰어
          </button>
          <button
            onClick={() => navigate("chat")}
            className={`hover:text-[#40A8A8] transition-colors flex items-center gap-1 ${currentView === "chat" ? "text-[#40A8A8]" : ""}`}
          >
            <MessageCircle size={18} /> 챗봇
          </button>
        </nav>
        <button
          className="md:hidden text-gray-600 bg-gray-100 p-2 rounded-full"
          onClick={() => navigate("home")}
        >
          <Home size={20} />
        </button>
      </div>
    </header>
  );
}

function HomeView({
  coaches,
  reviewers,
  trendingSearchTerms,
  activityLogs,
  navigate,
  openSearch,
}) {
  const [logFilter, setLogFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");

  const filteredLogs = activityLogs.filter((log) => {
    if (logFilter === "전체") return true;
    if (logFilter === "리뷰") return log.type === "review";
    if (logFilter === "태그") return log.type === "tag";
    return true;
  });
  const topCoaches = [...coaches]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
  const topReviewers = [...reviewers]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  function submit(event) {
    event.preventDefault();
    openSearch(keyword);
  }

  return (
    <div className="animate-fade-in text-gray-800 font-body pb-20">
      <section className="relative py-24 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="flex gap-4 mb-6">
            <CoachPlanet
              className="w-16 h-16 animate-bounce"
              style={{ animationDelay: "0s", animationDuration: "2s" }}
            />
            <ReviewerPlanet
              className="w-16 h-16 animate-bounce"
              style={{ animationDelay: "0.5s", animationDuration: "2s" }}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-baemin text-gray-900 mb-4 tracking-wide">
            우아한 테크코스
            <br />
            최고의 멘토를 만나보세요
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            코치와 리뷰어에 대한 진솔한 후기와 기록
          </p>
        </div>

        <form
          onSubmit={submit}
          className="w-full max-w-2xl relative shadow-xl rounded-full bg-white mb-6"
        >
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="코치와 리뷰어를 검색해보세요!"
            className="w-full pl-8 pr-16 py-5 rounded-full border-2 border-gray-100 focus:border-[#40A8A8] focus:outline-none text-lg transition-all font-medium"
          />
          <button className="absolute right-3 top-3 p-3 bg-[#40A8A8] text-white rounded-full hover:bg-teal-600 transition-colors shadow-md">
            <Search size={22} />
          </button>
        </form>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-baemin flex items-center justify-center gap-3 text-gray-900">
            <Crown className="text-yellow-400 fill-current" size={36} /> 우슐랭
            픽
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            크루들이 가장 많이 찾은 이달의 멘토
          </p>
        </div>

        <div className="space-y-16">
          <PickSection
            title="코치 부문 Top 3"
            icon="🎓"
            color={PRIMARY}
            light={PRIMARY_LIGHT}
            items={topCoaches}
            type="coach"
            navigate={navigate}
          />
          <PickSection
            title="리뷰어 부문 Top 3"
            icon="🔍"
            color="#FF8A65"
            light="#FFEBEE"
            items={topReviewers}
            type="reviewer"
            navigate={navigate}
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[rgba(0,0,0,0.15)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[350px]">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#e8f8f8] border-b border-[rgba(0,0,0,0.09)] shrink-0">
              <span className="text-[15px] leading-none">🔥</span>
              <span className="text-[13px] font-bold text-[#1e6668] flex-1">
                실시간 인기 멘토
              </span>
              <span className="text-[11px] text-[#2a8a8c] tabular-nums tracking-tighter">
                {trendingSearchTerms[0]?.basedAt ?? ""}
              </span>
            </div>
            <ul className="py-1.5 overflow-y-auto custom-scrollbar flex-1">
              {trendingSearchTerms.map((item) => (
                <li
                  key={item.rank}
                  className="flex items-center gap-2.5 px-4 py-2.5 border-b border-[rgba(0,0,0,0.09)] hover:bg-[#e8f8f8] transition-colors cursor-default last:border-0"
                >
                  <span
                    className={`text-[13px] font-bold w-[18px] text-center shrink-0 tabular-nums ${item.rank === 1 ? "text-[#f5a623] text-[15px]" : "text-[#40A8A8]"}`}
                  >
                    {item.rank}
                  </span>
                  <span className="text-[14px] font-medium text-[#1a1a1a] flex-1 truncate">
                    {item.keyword}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] shrink-0 leading-[1.4] ${item.type === "new" ? "bg-[#3DBBBD] text-white" : item.type === "up" ? "bg-[#fdf0ee] text-[#e74c3c]" : "bg-[#eef5fd] text-[#3498db]"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span
                    className={`text-[12px] text-[#999] shrink-0 tabular-nums ${item.rank === 1 ? "text-[#3DBBBD] scale-110 font-bold transform" : ""}`}
                  >
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.15)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[350px]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#fefefe] border-b border-[rgba(0,0,0,0.09)] flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold text-[#1e6668]">
                  최신 기록
                </span>
                <div className="flex gap-1.5">
                  {["전체", "리뷰", "태그"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`text-[12px] font-medium px-3 py-1 rounded-[20px] border transition-all ${logFilter === filter ? "border-[#3DBBBD] bg-[#3DBBBD] text-white" : "border-[rgba(0,0,0,0.15)] bg-white text-[#666] hover:border-[#3DBBBD] hover:text-[#3DBBBD]"}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-[#999]">
                <span className="w-[7px] h-[7px] rounded-full bg-[#2ecc71] animate-pulse"></span>{" "}
                Live
              </div>
            </div>

            <ul className="px-4 py-2 overflow-y-auto custom-scrollbar flex-1">
              {filteredLogs.length === 0 ? (
                <li className="py-8 text-center text-gray-400 text-sm">
                  해당하는 기록이 없습니다.
                </li>
              ) : (
                filteredLogs.map((log, index, arr) => (
                  <li
                    key={log.id}
                    className="flex gap-3.5 py-3 border-b border-[rgba(0,0,0,0.09)] last:border-0 items-start"
                  >
                    <div className="flex flex-col items-center pt-1 w-[14px] shrink-0">
                      <div
                        className="w-[10px] h-[10px] rounded-full shrink-0"
                        style={{ backgroundColor: log.dot }}
                      ></div>
                      {index !== arr.length - 1 && (
                        <div className="w-[1.5px] flex-1 min-h-[20px] bg-[rgba(0,0,0,0.09)] mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] leading-[1.5] flex flex-wrap items-baseline gap-[3px] mb-[5px]">
                        <span className="font-bold text-[#1a1a1a]">
                          {log.actor}
                        </span>
                        <span className="text-[#666]">{log.action}</span>
                        <span
                          className="font-bold text-[#2a8a8c] underline underline-offset-2 cursor-pointer hover:text-[#3DBBBD]"
                          onClick={() => navigate("coaches")}
                        >
                          {log.target}
                        </span>
                        <span className="text-[#666]">{log.tail}</span>
                        {log.extra && log.extraType !== "tag" && (
                          <span className="text-[#f5a623] text-[13px] tracking-[1px] ml-1">
                            {log.extra}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-[5px]">
                        {log.extra && log.extraType === "tag" && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-[2px] bg-[#e8f8f8] text-[#2a8a8c]">
                            {log.extra}
                          </span>
                        )}
                        <span className="text-[12px] text-[#999] ml-auto shrink-0">
                          {log.time}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-[#E8F5F5] rounded-[2rem] p-10 flex justify-between items-center relative overflow-hidden shadow-sm">
          <PlanetLogo className="w-48 h-48 text-[#40A8A8] opacity-10 absolute -right-10 -bottom-10" />
          <div>
            <h3 className="font-baemin text-3xl text-gray-900 mb-3 z-10 relative">
              동결건조 봇과 대화해보세요
            </h3>
            <p className="text-teal-800 text-lg font-medium z-10 relative">
              멘토님들이 바쁘실 땐 귀여운 행성이 봇을 찾아주세요!
            </p>
          </div>
          <button
            onClick={() => navigate("chat")}
            className="z-10 px-8 py-4 bg-[#40A8A8] text-white rounded-full font-bold text-lg hover:bg-teal-600 transition-transform hover:scale-105 shadow-xl whitespace-nowrap"
          >
            채팅 시작하기
          </button>
        </div>
      </section>
    </div>
  );
}

function PickSection({ title, icon, color, light, items, type, navigate }) {
  return (
    <div>
      <h3
        className="text-2xl font-baemin mb-6 flex items-center gap-2"
        style={{ color }}
      >
        <span className="p-2 rounded-xl" style={{ backgroundColor: light }}>
          {icon}
        </span>{" "}
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <div
            key={`${type}-${item.id}`}
            onClick={() => navigate("detail", item, type)}
            className="group relative bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300 border border-gray-100"
          >
            <div
              className="absolute top-5 left-5 z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-baemin text-2xl shadow-lg transform -rotate-6"
              style={{
                backgroundColor:
                  index === 0 ? "#F59E0B" : index === 1 ? "#9CA3AF" : "#D97706",
              }}
            >
              {index + 1}
            </div>
            <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center">
              <FallbackImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-8 text-center relative bg-white rounded-t-[2rem] -mt-6 z-10">
              <div className="flex justify-center mb-2">
                <TrackBadge track={item.track} />
              </div>
              <h3 className="text-2xl font-baemin text-gray-900 mt-2">
                {item.name} {TYPE_CONFIG[type].label}
              </h3>
              <div className="flex justify-center mt-3 mb-5 bg-gray-50 py-2 rounded-2xl">
                <StarRating rating={item.rating} size={20} />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {item.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1.5 font-bold rounded-xl"
                    style={{ backgroundColor: light, color }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListView({ type, items, navigate, loadList }) {
  const isCoach = type === "coach";
  const title = isCoach ? "코치 목록" : "리뷰어 목록";
  const Icon = isCoach ? CoachPlanet : ReviewerPlanet;
  const [track, setTrack] = useState("전체");

  useEffect(() => {
    const part = TRACK_TO_PART[track] ?? "";
    loadList(type, part);
  }, [type, track]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in font-body bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-gray-100">
            <Icon className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-4xl font-baemin text-gray-900">{title}</h1>
            <p className="text-gray-500 font-medium mt-2">
              우테코의 훌륭한 {isCoach ? "코치진" : "리뷰어"}을 만나보세요.
            </p>
          </div>
        </div>
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {["전체", "BE", "FE", "AOS", "CT", "Soft"].map((option) => (
            <button
              key={option}
              onClick={() => setTrack(option)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${track === option ? "bg-[#40A8A8] text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={`${type}-${item.id}`}
            onClick={() => navigate("detail", item, type)}
            className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col group"
          >
            <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center">
              <FallbackImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 z-10">
                <TrackBadge track={item.track} />
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col relative bg-white rounded-t-[2rem] -mt-6 z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-3xl font-baemin text-gray-900">
                  {item.name}
                </h3>
                <div className="bg-gray-50 px-2 py-1 rounded-lg">
                  <StarRating rating={item.rating} size={16} />
                </div>
              </div>
              {!isCoach && (
                <p className="text-sm text-[#FF8A65] font-bold mb-4 bg-[#FFEBEE] w-fit px-3 py-1 rounded-xl">
                  스타일: {item.style}
                </p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 font-medium rounded-xl"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExternalActionButton({ href, children, variant = "dark" }) {
  const enabled = Boolean(href);
  const baseClass =
    "flex-1 flex justify-center items-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all";
  const variantClass =
    variant === "teal"
      ? "bg-[#40A8A8] text-white hover:bg-teal-600"
      : "bg-gray-900 text-white hover:bg-gray-800";
  const disabledClass = "bg-gray-100 text-gray-400 cursor-not-allowed";

  if (!enabled) {
    return (
      <button type="button" disabled className={`${baseClass} ${disabledClass}`}>
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${baseClass} ${variantClass}`}
    >
      {children}
    </a>
  );
}

function DetailView({
  selectedItem,
  selectedType,
  detail,
  navigate,
  refreshDetail,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [activeReview, setActiveReview] = useState(null);
  const [password, setPassword] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [error, setError] = useState("");

  if (!selectedItem) return null;

  const isCoach = selectedType === "coach";
  const item = detail ?? selectedItem;
  const targetReviews = item.reviews ?? [];

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (!activeReview) return;
    if (modalAction === "delete") {
      try {
        await api(
          `${TYPE_CONFIG[selectedType].api}/${item.id}/reviews/${activeReview.id}`,
          {
            method: "DELETE",
            body: JSON.stringify({ password }),
          },
        );
        setModalOpen(false);
        setPassword("");
        setActiveReview(null);
        await refreshDetail();
      } catch (err) {
        setError(err.message);
      }
    } else {
      setEditingReviewId(activeReview.id);
      setEditingContent(activeReview.content);
      setModalOpen(false);
      setActiveReview(null);
    }
  }

  async function saveEditedReview(review) {
    if (!editingContent.trim()) return;
    try {
      await api(
        `${TYPE_CONFIG[selectedType].api}/${item.id}/reviews/${review.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            nickname: review.author,
            password,
            rating: review.rating,
            content: editingContent,
            tagIds: [],
          }),
        },
      );
      setEditingReviewId(null);
      setPassword("");
      await refreshDetail();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 animate-fade-in font-body">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(isCoach ? "coaches" : "reviewers")}
          className="text-base font-bold text-gray-500 hover:text-[#40A8A8] flex items-center gap-2 mb-8 bg-white px-4 py-2 rounded-full w-fit shadow-sm"
        >
          <ChevronRight size={18} className="rotate-180" /> 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/5 relative h-80 md:h-auto bg-gray-100 flex items-center justify-center">
              <FallbackImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-3/5 p-10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <TrackBadge track={item.track} />
                    <h1 className="text-4xl font-baemin text-gray-900 mt-4">
                      {item.name} {isCoach ? "코치" : "리뷰어"}
                    </h1>
                  </div>
                  <div className="text-center bg-yellow-50 p-3 rounded-2xl">
                    <div className="text-3xl font-baemin text-yellow-600">
                      {Number(item.rating || 0).toFixed(1)}
                    </div>
                    <StarRating rating={item.rating} size={16} />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mb-8">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border border-gray-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {isCoach ? (
                  <>
                    <ExternalActionButton
                      href={item.oneOnOneQuestionUrl}
                      variant="teal"
                    >
                      원온원 사전 질문
                    </ExternalActionButton>
                    <ExternalActionButton href={item.oneOnOneUrl}>
                      원온원 신청
                    </ExternalActionButton>
                  </>
                ) : (
                  <ExternalActionButton href={item.slackUrl} variant="teal">
                    슬랙 DM
                  </ExternalActionButton>
                )}
                <button
                  onClick={() => navigate("write", item, selectedType)}
                  className="flex-1 flex justify-center items-center gap-2 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl hover:bg-gray-50 font-bold text-lg"
                >
                  <Edit3 size={20} /> 리뷰 남기기
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10">
          <h3 className="text-2xl font-baemin mb-8 flex items-center gap-3 text-gray-900">
            <MessageSquare size={28} className="text-[#40A8A8]" /> 우테코
            크루들의 생생 후기
            <span className="bg-[#E8F5F5] text-[#40A8A8] text-sm px-3 py-1 rounded-full">
              {targetReviews.length}
            </span>
          </h3>

          {error && (
            <p className="mb-4 text-red-500 text-sm font-bold">{error}</p>
          )}

          <div className="space-y-6">
            {targetReviews.length === 0 && (
              <p className="py-8 text-center text-gray-400 text-sm">
                등록된 후기가 없습니다.
              </p>
            )}
            {targetReviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <User size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        {review.author}
                      </p>
                      <p className="text-sm text-gray-500 font-medium">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={16} />
                </div>

                {editingReviewId === review.id ? (
                  <div className="mt-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-inner">
                    <textarea
                      className="w-full bg-transparent border-none outline-none resize-none font-medium text-gray-800 text-base"
                      rows={3}
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(event.target.value)
                      }
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setEditingReviewId(null);
                          setPassword("");
                        }}
                        className="px-4 py-1.5 rounded-lg font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => saveEditedReview(review)}
                        className="px-4 py-1.5 rounded-lg font-bold text-sm text-white bg-[#40A8A8] hover:bg-teal-600 flex items-center gap-1"
                      >
                        <Check size={14} /> 저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 text-base leading-relaxed font-medium bg-white p-4 rounded-2xl border border-gray-100">
                      {review.content}
                    </p>
                    {review.tags && review.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pl-2">
                        {review.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-1 bg-[#E8F5F5] text-[#40A8A8] font-bold rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {editingReviewId !== review.id && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setActiveReview(review);
                        setModalAction("edit");
                        setPassword("");
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Edit2 size={14} /> 편집
                    </button>
                    <button
                      onClick={() => {
                        setActiveReview(review);
                        setModalAction("delete");
                        setPassword("");
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalAction === "delete" ? "bg-red-100" : "bg-blue-100"}`}
              >
                <Lock
                  className={
                    modalAction === "delete" ? "text-red-500" : "text-blue-500"
                  }
                  size={32}
                />
              </div>
              <h3 className="font-baemin text-2xl text-gray-900">
                리뷰 {modalAction === "delete" ? "삭제" : "편집"}
              </h3>
              <p className="text-gray-500 font-medium mt-2 text-sm">
                작성 시 입력한 비밀번호를 입력해주세요.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none mb-4 font-bold text-center tracking-widest text-lg ${modalAction === "delete" ? "focus:border-red-400" : "focus:border-blue-400"}`}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setPassword("");
                    setActiveReview(null);
                  }}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-4 text-white font-bold rounded-2xl shadow-lg ${modalAction === "delete" ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30"}`}
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function WriteReviewView({
  selectedItem,
  selectedType,
  tags,
  navigate,
  onCreated,
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("익명의크루");
  const [password, setPassword] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState("");

  if (!selectedItem) return null;

  function toggleTag(tag) {
    if (selectedTags.some((selected) => selected.id === tag.id)) {
      setSelectedTags(
        selectedTags.filter((selected) => selected.id !== tag.id),
      );
      return;
    }
    if (selectedTags.length >= 3) return;
    setSelectedTags([...selectedTags, tag]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("리뷰 내용을 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }
    try {
      await api(`${TYPE_CONFIG[selectedType].api}/${selectedItem.id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          nickname: author,
          password,
          rating,
          content,
          tagIds: selectedTags.map((tag) => tag.id),
        }),
      });
      await onCreated();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in font-body">
      <button
        onClick={() => navigate("detail", selectedItem, selectedType)}
        className="text-base font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-12 bg-white px-4 py-2 rounded-full w-fit shadow-sm"
      >
        <X size={18} /> 작성을 취소하고 돌아가기
      </button>

      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-12 relative">
        <div className="text-center mb-10 pb-8 border-b border-gray-100 relative mt-10">
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[100px] h-[100px] bg-white rounded-full p-1 shadow-sm border border-gray-100">
            <FallbackImage
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-baemin text-gray-900 pt-6 mb-2">
            {selectedItem.name}{" "}
            {selectedType === "coach" ? "코치님" : "리뷰어님"} 리뷰
          </h2>
          <p className="text-gray-500 font-medium">
            솔직하고 유익한 후기를 남겨주세요.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-red-500 text-sm font-bold">{error}</p>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center bg-gray-50 py-8 rounded-3xl border border-gray-100">
            <span className="text-base font-bold text-gray-700 mb-4">
              종합 평점
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-125"
                >
                  <Star
                    size={48}
                    className={
                      star <= (hoverRating || rating) ? "fill-current" : ""
                    }
                    style={{
                      color:
                        star <= (hoverRating || rating) ? "#FFC107" : "#E5E7EB",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              리뷰 내용
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:border-[#40A8A8] focus:bg-white outline-none transition-all resize-none font-medium text-lg"
              placeholder="코치님의 피드백 스타일 등 유용한 내용을 남겨주세요."
            ></textarea>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-900 mb-3">
              추천 태그{" "}
              <span className="text-sm font-normal text-gray-500">
                (최대 3개 선택)
              </span>
            </label>
            <div className="flex flex-wrap gap-2 bg-gray-50 p-6 rounded-3xl border border-gray-100">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 text-sm font-bold rounded-xl transition-all border ${selectedTags.some((selected) => selected.id === tag.id) ? "bg-[#40A8A8] text-white border-[#40A8A8] shadow-md transform scale-105" : "bg-white text-gray-600 border-gray-200 hover:border-[#40A8A8] hover:text-[#40A8A8]"}`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:border-[#40A8A8] focus:outline-none font-bold text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                비밀번호 (수정/삭제용)
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="****"
                required
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:border-[#40A8A8] focus:outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-[#40A8A8] text-white font-baemin text-xl rounded-2xl hover:bg-teal-600 transition-transform hover:scale-[1.02] shadow-xl"
          >
            리뷰 등록 완료하기
          </button>
        </form>
      </div>
    </div>
  );
}

function SearchView({ results, keyword, openSearch, navigate }) {
  const [value, setValue] = useState(keyword);

  function submit(event) {
    event.preventDefault();
    openSearch(value);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in font-body bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 border border-gray-100">
            <PlanetLogo className="w-full h-full text-[#40A8A8]" />
          </div>
          <div>
            <h1 className="text-4xl font-baemin text-gray-900">통합 검색</h1>
            <p className="text-gray-500 font-medium mt-2">
              코치, 리뷰어, 또는 태그로 검색해보세요.
            </p>
          </div>
        </div>
      </div>
      <form
        onSubmit={submit}
        className="w-full relative shadow-xl rounded-full bg-white mb-10"
      >
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="코치, 리뷰어, 또는 태그로 검색해보세요!"
          className="w-full pl-8 pr-16 py-5 rounded-full border-2 border-gray-100 focus:border-[#40A8A8] focus:outline-none text-lg transition-all font-medium"
        />
        <button className="absolute right-3 top-3 p-3 bg-[#40A8A8] text-white rounded-full hover:bg-teal-600 transition-colors shadow-md">
          <Search size={22} />
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            onClick={() => navigate("detail", item, item.type)}
            className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col group"
          >
            <div className="h-64 overflow-hidden relative bg-gray-100 flex items-center justify-center">
              <FallbackImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 z-10">
                <TrackBadge track={item.track} />
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col relative bg-white rounded-t-[2rem] -mt-6 z-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-3xl font-baemin text-gray-900">
                  {item.name}
                </h3>
                <div className="bg-gray-50 px-2 py-1 rounded-lg">
                  <StarRating rating={item.rating} size={16} />
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1.5 bg-gray-50 text-gray-600 font-medium rounded-xl"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className="text-gray-400 text-sm">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function ChatbotView({ coaches }) {
  const bots = coaches.filter((coach) => coach.botId).slice(0, 3);
  const [selectedBot, setSelectedBot] = useState(bots[0]?.botId ?? "gump");
  const [chatUserName, setChatUserName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 이름을 알려주시면 더 친근하게 답변해 드릴게요.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedBot && bots[0]?.botId) {
      setSelectedBot(bots[0].botId);
    }
  }, [bots, selectedBot]);

  const selectedCoach =
    bots.find((bot) => bot.botId === selectedBot) ?? bots[0];

  async function handleSendMessage() {
    if (!chatInput.trim() || !selectedCoach) return;
    const currentInput = chatInput;
    const currentUser = chatUserName || "익명의 크루";

    setMessages((prev) => [...prev, { sender: "user", text: currentInput }]);
    setChatInput("");
    setLoading(true);
    try {
      const response = await api("/api/v1/chatbot/chat", {
        method: "POST",
        body: JSON.stringify({
          botId: selectedCoach.botId,
          userName: currentUser,
          message: currentInput,
        }),
      });
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            response.reply ??
            `${currentUser}님, 질문 감사합니다! 우슐랭 봇이 열심히 답변을 고민 중이에요.`,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6 animate-fade-in font-body bg-gray-50">
      <div className="w-full md:w-1/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 h-fit">
        <h3 className="font-baemin text-2xl mb-6 px-2 flex items-center gap-3 text-gray-900">
          <PlanetLogo className="w-8 h-8 text-[#40A8A8]" /> 동결건조 봇
        </h3>
        <div className="space-y-3">
          {bots.map((bot) => (
            <div
              key={bot.id}
              onClick={() => {
                setSelectedBot(bot.botId);
                setMessages([
                  {
                    sender: "bot",
                    text: `안녕하세요! ${bot.name} 봇입니다. 이름을 알려주세요!`,
                  },
                ]);
              }}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedBot === bot.botId ? "bg-[#E8F5F5] border-[#40A8A8] shadow-sm" : "hover:bg-gray-50 border-transparent"}`}
            >
              <div className="relative">
                <FallbackImage
                  src={bot.image}
                  alt={`${bot.name} 봇`}
                  className="w-14 h-14 rounded-full object-cover shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <CoachPlanet className="w-5 h-5 text-[#40A8A8]" />
                </div>
              </div>
              <div>
                <p
                  className={`font-baemin text-lg ${selectedBot === bot.botId ? "text-[#40A8A8]" : "text-gray-900"}`}
                >
                  {bot.name} 봇
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {bot.botDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col h-[600px] md:h-full overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <PlanetLogo className="w-64 h-64" />
        </div>

        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white z-10">
          <div className="flex items-center gap-4">
            {selectedCoach && (
              <>
                <FallbackImage
                  src={selectedCoach.image}
                  alt={`${selectedCoach.name} 봇`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-baemin text-xl text-gray-900">
                    {selectedCoach.name} 봇
                  </p>
                  <p className="text-sm text-[#40A8A8] font-bold flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#40A8A8] inline-block animate-pulse"></span>{" "}
                    온라인
                  </p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <span className="text-sm font-bold text-gray-600">내 이름:</span>
            <input
              type="text"
              placeholder="크루 이름"
              value={chatUserName}
              onChange={(event) => setChatUserName(event.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 w-24 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 space-y-6 z-10 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${message.sender === "user" ? "justify-end flex-row-reverse" : ""}`}
            >
              {message.sender === "bot" && (
                <FallbackImage
                  src={selectedCoach?.image}
                  alt="bot"
                  className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0"
                />
              )}
              <div
                className={`p-4 rounded-3xl shadow-sm max-w-[80%] text-base font-medium leading-relaxed ${message.sender === "user" ? "bg-[#40A8A8] text-white rounded-tr-sm" : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"}`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-3xl shadow-sm max-w-[80%] text-base font-medium leading-relaxed bg-white text-gray-800 border border-gray-200 rounded-tl-sm">
              답변을 준비하고 있어요...
            </div>
          )}
        </div>
        <div className="p-5 bg-white border-t border-gray-100 z-10">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="메시지를 입력하세요..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) =>
                event.key === "Enter" && handleSendMessage()
              }
              className="w-full bg-gray-100 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-[#40A8A8]/50 text-base font-medium"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-2 p-3 bg-[#40A8A8] text-white rounded-full hover:bg-teal-600 transition-transform hover:scale-105 shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [coaches, setCoaches] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState("coach");
  const [detail, setDetail] = useState(null);
  const [tags, setTags] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [trendingSearchTerms, setTrendingSearchTerms] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  async function loadList(type, part = "") {
    const query = part ? `?part=${encodeURIComponent(part)}` : "";
    const data = await api(`${TYPE_CONFIG[type].api}${query}`);
    const normalized = data.map((item) => normalizeListItem(item, type));
    if (type === "coach") {
      setCoaches(normalized);
    } else {
      setReviewers(normalized);
    }
    return normalized;
  }

  async function loadDetail(item, type) {
    const data = await api(`${TYPE_CONFIG[type].api}/${item.id}`);
    const normalized = normalizeDetail(data, type);
    setDetail(normalized);
    setSelectedItem(normalized);
    return normalized;
  }

  async function navigate(view, item = null, type = selectedType) {
    setCurrentView(view);
    if (item) {
      setSelectedItem(item);
      setSelectedType(type);
    }
    if (view === "home") {
      await Promise.all([
        loadList("coach"),
        loadList("reviewer"),
        loadHomeSideData(),
      ]);
    }
    if (view === "chat") {
      await loadList("coach");
    }
    if (view === "detail" && item) {
      setDetail(null);
      await loadDetail(item, type);
    }
    if (view === "write" && item) {
      setTags(
        await api(
          `/api/v1/tags?type=${type === "coach" ? "COACH" : "REVIEWER"}`,
        ),
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openSearch(keyword) {
    setSearchKeyword(keyword);
    const data = await api(
      `/api/v1/search?keyword=${encodeURIComponent(keyword)}`,
    );
    setSearchResults(
      (data.results ?? []).map((item) =>
        normalizeListItem(
          item,
          item.targetType === "COACH" ? "coach" : "reviewer",
        ),
      ),
    );
    setCurrentView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function refreshDetail() {
    if (selectedItem) {
      await loadDetail(selectedItem, selectedType);
      setCurrentView("detail");
    }
  }

  async function loadHomeSideData() {
    const [trending, logs] = await Promise.all([
      api("/api/v1/search/trending"),
      api("/api/v1/activity-logs"),
    ]);
    setTrendingSearchTerms(trending);
    setActivityLogs(logs);
  }

  useEffect(() => {
    Promise.all([
      loadList("coach"),
      loadList("reviewer"),
      loadHomeSideData(),
    ]).catch((error) => {
      console.error(error);
    });
  }, []);

  const content = useMemo(() => {
    if (currentView === "home")
      return (
        <HomeView
          coaches={coaches}
          reviewers={reviewers}
          trendingSearchTerms={trendingSearchTerms}
          activityLogs={activityLogs}
          navigate={navigate}
          openSearch={openSearch}
        />
      );
    if (currentView === "coaches")
      return (
        <ListView
          type="coach"
          items={coaches}
          navigate={navigate}
          loadList={loadList}
        />
      );
    if (currentView === "reviewers")
      return (
        <ListView
          type="reviewer"
          items={reviewers}
          navigate={navigate}
          loadList={loadList}
        />
      );
    if (currentView === "detail")
      return (
        <DetailView
          selectedItem={selectedItem}
          selectedType={selectedType}
          detail={detail}
          navigate={navigate}
          refreshDetail={refreshDetail}
        />
      );
    if (currentView === "write")
      return (
        <WriteReviewView
          selectedItem={selectedItem}
          selectedType={selectedType}
          tags={tags}
          navigate={navigate}
          onCreated={refreshDetail}
        />
      );
    if (currentView === "search")
      return (
        <SearchView
          results={searchResults}
          keyword={searchKeyword}
          openSearch={openSearch}
          navigate={navigate}
        />
      );
    if (currentView === "chat") return <ChatbotView coaches={coaches} />;
    return null;
  }, [
    currentView,
    coaches,
    reviewers,
    selectedItem,
    selectedType,
    detail,
    tags,
    searchKeyword,
    searchResults,
    trendingSearchTerms,
    activityLogs,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentView={currentView} navigate={navigate} />
      <main className="flex-1">{content}</main>
      <footer className="bg-gray-900 text-white py-16 mt-auto rounded-t-[3rem]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <PlanetLogo className="w-10 h-10 text-[#40A8A8]" />
              <span className="text-3xl font-baemin tracking-wide">
                우슐랭가이드
              </span>
            </div>
            <p className="text-gray-400 font-medium text-sm text-center md:text-left">
              우아한 테크 코스 크루들을 위한 솔직 담백 리뷰 플랫폼
            </p>
          </div>
          <div className="text-sm font-bold text-gray-500 bg-gray-800 px-6 py-3 rounded-full">
            © 2026 Woochelin Guide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
