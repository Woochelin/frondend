import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const PART_LABELS = {
  BACKEND: 'BE',
  FRONTEND: 'FE',
  ANDROID: 'AOS',
  COMMON: 'CT',
  SOFT_SKILL: 'Soft'
};

const PART_FILTERS = [
  ['전체', ''],
  ['BE', 'BACKEND'],
  ['FE', 'FRONTEND'],
  ['AOS', 'ANDROID'],
  ['CT', 'COMMON'],
  ['Soft', 'SOFT_SKILL']
];

const TARGET_LABELS = {
  COACH: '코치',
  REVIEWER: '리뷰어'
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  if (response.status === 204) {
    return null;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || '요청 처리에 실패했습니다.');
  }
  return body;
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function Stars({ rating = 0 }) {
  const rounded = Math.round(rating);
  return (
    <span className="stars" aria-label={`평점 ${rating}`}>
      {'★'.repeat(rounded)}
      {'☆'.repeat(Math.max(0, 5 - rounded))}
      <b>{Number(rating).toFixed(1)}</b>
    </span>
  );
}

function TagList({ tags = [] }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <span className="tag" key={tag.id ?? tag.name}>
          #{tag.name}
          {tag.count ? <small>{tag.count}</small> : null}
        </span>
      ))}
    </div>
  );
}

function ProfileImage({ src, alt }) {
  return (
    <div className="profile-image">
      {src ? <img src={src} alt={alt} /> : <span>{alt}</span>}
    </div>
  );
}

function Header({ view, goHome, openList, openChat, openSearch }) {
  const [keyword, setKeyword] = useState('');

  function submit(event) {
    event.preventDefault();
    openSearch(keyword);
  }

  return (
    <header className="app-header">
      <button className="brand" onClick={goHome}>
        <span className="logo">W</span>
        <span>우슐랭가이드</span>
      </button>
      <form className="header-search" onSubmit={submit}>
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="코치/리뷰어 이름 검색" />
        <button type="submit">검색</button>
      </form>
      <nav>
        <button className={view === 'coaches' ? 'active' : ''} onClick={() => openList('COACH')}>코치</button>
        <button className={view === 'reviewers' ? 'active' : ''} onClick={() => openList('REVIEWER')}>리뷰어</button>
        <button className={view === 'chat' ? 'active' : ''} onClick={openChat}>챗봇</button>
      </nav>
    </header>
  );
}

function HomeView({ home, openDetail, openSearch, openChat }) {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Woochelin Guide</p>
          <h1>코치와 리뷰어의 스타일을 미리 탐색하세요</h1>
          <p>상세 조회 랭킹, 최신 리뷰, 코치 페르소나 챗봇까지 실제 백엔드 데이터로 연결됩니다.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => openSearch('')}>통합 검색</button>
            <button className="secondary" onClick={openChat}>동결건조 봇</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>이번 주 Top 3</h2>
          <p>최근 7일 상세 조회 기준 통합 랭킹</p>
        </div>
        <div className="rank-grid">
          {(home?.weeklyRanking ?? []).map((item, index) => (
            <button className="rank-card" key={`${item.targetType}-${item.targetId}`} onClick={() => openDetail(item.targetType, item.targetId)}>
              <span className="rank-number">{index + 1}</span>
              <ProfileImage src={item.profileImageUrl} alt={item.name} />
              <strong>{item.name} {TARGET_LABELS[item.targetType]}</strong>
              <span>{PART_LABELS[item.part] ?? item.part}</span>
              <small>{item.viewCount} views</small>
            </button>
          ))}
          {(home?.weeklyRanking ?? []).length === 0 ? <Empty text="아직 조회 랭킹이 없습니다." /> : null}
        </div>
      </section>

      <section className="section two-column">
        <Panel title="최근 리뷰">
          <div className="review-feed">
            {(home?.recentReviews ?? []).map((review) => (
              <button className="feed-item" key={`${review.targetType}-${review.reviewId}`} onClick={() => openDetail(review.targetType, review.targetId)}>
                <div>
                  <strong>{review.targetName} {TARGET_LABELS[review.targetType]}</strong>
                  <span>{review.nickname} · {formatDate(review.createdAt)}</span>
                </div>
                <Stars rating={review.rating} />
                <p>{review.content}</p>
              </button>
            ))}
            {(home?.recentReviews ?? []).length === 0 ? <Empty text="아직 등록된 리뷰가 없습니다." /> : null}
          </div>
        </Panel>
        <Panel title="챗봇">
          <div className="chat-teaser">
            <h3>코치 페르소나를 먼저 만나보세요</h3>
            <p>메시지 히스토리는 이 페이지 안에서 유지됩니다. 새로고침 전까지 대화 흐름을 이어갈 수 있어요.</p>
            <button className="primary" onClick={openChat}>채팅 시작</button>
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ListView({ type, items, openDetail, reload }) {
  const [part, setPart] = useState('');
  const title = type === 'COACH' ? '코치 목록' : '리뷰어 목록';

  useEffect(() => {
    reload(part);
  }, [part]);

  return (
    <div className="page">
      <div className="section-title">
        <h1>{title}</h1>
        <p>파트별로 살펴보고 상세 페이지에서 리뷰와 태그 통계를 확인하세요.</p>
      </div>
      <div className="filter-bar">
        {PART_FILTERS.map(([label, value]) => (
          <button key={value || 'all'} className={part === value ? 'active' : ''} onClick={() => setPart(value)}>
            {label}
          </button>
        ))}
      </div>
      <CardGrid items={items} type={type} openDetail={openDetail} />
    </div>
  );
}

function SearchView({ keyword, results, openDetail, onSearch }) {
  const [value, setValue] = useState(keyword);

  function submit(event) {
    event.preventDefault();
    onSearch(value);
  }

  return (
    <div className="page">
      <div className="section-title">
        <h1>통합 검색</h1>
        <p>코치와 리뷰어를 이름으로 함께 검색합니다.</p>
      </div>
      <form className="search-form" onSubmit={submit}>
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="예: 검프, 로빈" />
        <button className="primary" type="submit">검색</button>
      </form>
      <CardGrid items={results} openDetail={openDetail} />
    </div>
  );
}

function CardGrid({ items = [], type, openDetail }) {
  if (items.length === 0) {
    return <Empty text="표시할 결과가 없습니다." />;
  }
  return (
    <div className="card-grid">
      {items.map((item) => {
        const targetType = type ?? item.targetType;
        const id = item.id ?? item.targetId;
        return (
          <button className="profile-card" key={`${targetType}-${id}`} onClick={() => openDetail(targetType, id)}>
            <ProfileImage src={item.profileImageUrl} alt={item.name} />
            <div>
              <span className="badge">{PART_LABELS[item.part] ?? item.part}</span>
              <h3>{item.name} {TARGET_LABELS[targetType]}</h3>
              <Stars rating={item.averageRating} />
              <TagList tags={item.topTags} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function DetailView({ type, detail, openWrite, refreshDetail }) {
  const [editing, setEditing] = useState(null);
  const [passwords, setPasswords] = useState({});
  const [error, setError] = useState('');
  const isCoach = type === 'COACH';

  async function remove(reviewId) {
    setError('');
    try {
      await api(`${isCoach ? '/api/v1/coaches' : '/api/v1/reviewers'}/${detail.id}/reviews/${reviewId}`, {
        method: 'DELETE',
        body: JSON.stringify({ password: passwords[reviewId] ?? '' })
      });
      await refreshDetail();
    } catch (error) {
      setError(error.message);
    }
  }

  async function update(review) {
    setError('');
    try {
      await api(`${isCoach ? '/api/v1/coaches' : '/api/v1/reviewers'}/${detail.id}/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nickname: editing.nickname,
          password: passwords[review.id] ?? '',
          rating: editing.rating,
          content: editing.content,
          tagIds: editing.tags.map((tag) => tag.id)
        })
      });
      setEditing(null);
      await refreshDetail();
    } catch (error) {
      setError(error.message);
    }
  }

  if (!detail) {
    return <div className="page"><Empty text="상세 정보를 불러오는 중입니다." /></div>;
  }

  return (
    <div className="page">
      <section className="detail-header">
        <ProfileImage src={detail.profileImageUrl} alt={detail.name} />
        <div>
          <span className="badge">{PART_LABELS[detail.part] ?? detail.part}</span>
          <h1>{detail.name} {TARGET_LABELS[type]}</h1>
          <Stars rating={detail.averageRating} />
          <TagList tags={detail.topTags} />
          <div className="detail-actions">
            <a className="primary link-button" href={detail.slackUrl} target="_blank" rel="noreferrer">
              슬랙으로 {isCoach ? '원온원' : '커피챗'} 신청하기
            </a>
            <button className="secondary" onClick={openWrite}>리뷰 남기기</button>
          </div>
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="section">
        <div className="section-title">
          <h2>리뷰 {detail.reviews.length}개</h2>
          <p>수정/삭제에는 작성 시 입력한 비밀번호가 필요합니다.</p>
        </div>
        <div className="review-list">
          {detail.reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-head">
                <strong>{review.nickname}</strong>
                <span>{formatDate(review.createdAt)}</span>
                <Stars rating={review.rating} />
              </div>
              {editing?.id === review.id ? (
                <div className="edit-box">
                  <input value={editing.nickname} onChange={(event) => setEditing({ ...editing, nickname: event.target.value })} />
                  <select value={editing.rating} onChange={(event) => setEditing({ ...editing, rating: Number(event.target.value) })}>
                    {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}점</option>)}
                  </select>
                  <textarea value={editing.content} onChange={(event) => setEditing({ ...editing, content: event.target.value })} />
                  <PasswordInput reviewId={review.id} passwords={passwords} setPasswords={setPasswords} />
                  <div className="button-row">
                    <button className="primary" onClick={() => update(review)}>수정 저장</button>
                    <button className="secondary" onClick={() => setEditing(null)}>취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{review.content}</p>
                  <TagList tags={review.tags} />
                  <div className="review-actions">
                    <PasswordInput reviewId={review.id} passwords={passwords} setPasswords={setPasswords} />
                    <button className="secondary" onClick={() => setEditing({ ...review })}>수정</button>
                    <button className="danger" onClick={() => remove(review.id)}>삭제</button>
                  </div>
                </>
              )}
            </article>
          ))}
          {detail.reviews.length === 0 ? <Empty text="아직 리뷰가 없습니다." /> : null}
        </div>
      </section>
    </div>
  );
}

function PasswordInput({ reviewId, passwords, setPasswords }) {
  return (
    <input
      className="password-input"
      type="password"
      placeholder="수정/삭제 비밀번호"
      value={passwords[reviewId] ?? ''}
      onChange={(event) => setPasswords({ ...passwords, [reviewId]: event.target.value })}
    />
  );
}

function WriteReviewView({ type, target, tags, onCancel, onCreated }) {
  const [form, setForm] = useState({
    nickname: '',
    password: '',
    rating: 5,
    content: '',
    tagIds: []
  });
  const [error, setError] = useState('');
  const isCoach = type === 'COACH';

  function toggleTag(tagId) {
    setForm((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((id) => id !== tagId)
        : [...current.tagIds, tagId]
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await api(`${isCoach ? '/api/v1/coaches' : '/api/v1/reviewers'}/${target.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      await onCreated();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="page narrow">
      <button className="secondary" onClick={onCancel}>돌아가기</button>
      <section className="write-card">
        <ProfileImage src={target.profileImageUrl} alt={target.name} />
        <h1>{target.name} {TARGET_LABELS[type]} 리뷰</h1>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={submit}>
          <label>별점</label>
          <select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}점</option>)}
          </select>
          <label>리뷰 내용</label>
          <textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
          <label>태그</label>
          <div className="tag-picker">
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                className={form.tagIds.includes(tag.id) ? 'selected' : ''}
                onClick={() => toggleTag(tag.id)}
              >
                #{tag.name}
              </button>
            ))}
          </div>
          <div className="form-grid">
            <div>
              <label>닉네임</label>
              <input value={form.nickname} onChange={(event) => setForm({ ...form, nickname: event.target.value })} placeholder="비우면 익명" />
            </div>
            <div>
              <label>삭제/수정 비밀번호</label>
              <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </div>
          </div>
          <button className="primary wide" type="submit">등록하기</button>
        </form>
      </section>
    </div>
  );
}

function ChatView({ coaches, messagesByBot, setMessagesByBot }) {
  const [botId, setBotId] = useState(coaches[0]?.botId ?? '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!botId && coaches[0]?.botId) {
      setBotId(coaches[0].botId);
    }
  }, [botId, coaches]);

  const selectedCoach = coaches.find((coach) => coach.botId === botId);
  const messages = messagesByBot[botId] ?? [];

  function pushMessage(nextMessage) {
    setMessagesByBot((current) => ({
      ...current,
      [botId]: [...(current[botId] ?? []), nextMessage]
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!message.trim() || !botId) {
      return;
    }
    const userMessage = { role: 'user', text: message.trim() };
    pushMessage(userMessage);
    setMessage('');
    setLoading(true);
    setError('');
    try {
      const response = await api('/api/v1/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ botId, message: userMessage.text })
      });
      pushMessage({ role: 'bot', text: response.reply });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page chat-page">
      <aside className="bot-list">
        <h2>동결건조 봇</h2>
        {coaches.map((coach) => (
          <button key={coach.id} className={botId === coach.botId ? 'active' : ''} onClick={() => setBotId(coach.botId)}>
            <ProfileImage src={coach.profileImageUrl} alt={coach.name} />
            <span>{coach.name} 봇</span>
          </button>
        ))}
      </aside>
      <section className="chat-room">
        <div className="chat-title">
          <ProfileImage src={selectedCoach?.profileImageUrl} alt={selectedCoach?.name ?? '봇'} />
          <div>
            <h1>{selectedCoach?.name ?? '코치'} 봇</h1>
            <p>현재 화면 안에서 대화 히스토리가 유지됩니다.</p>
          </div>
        </div>
        <div className="messages">
          {messages.length === 0 ? (
            <div className="message bot">안녕하세요. 어떤 고민을 같이 살펴볼까요?</div>
          ) : null}
          {messages.map((item, index) => (
            <div className={`message ${item.role}`} key={index}>{item.text}</div>
          ))}
          {loading ? <div className="message bot">답변을 준비하고 있어요...</div> : null}
        </div>
        {error ? <p className="error">{error}</p> : null}
        <form className="chat-input" onSubmit={submit}>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="메시지를 입력하세요" />
          <button className="primary" type="submit">전송</button>
        </form>
      </section>
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function App() {
  const [view, setView] = useState('home');
  const [home, setHome] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [detailRef, setDetailRef] = useState(null);
  const [detail, setDetail] = useState(null);
  const [tags, setTags] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [messagesByBot, setMessagesByBot] = useState({});
  const [error, setError] = useState('');

  const currentList = view === 'reviewers' ? reviewers : coaches;

  const loadHome = async () => {
    setHome(await api('/api/v1/home'));
  };

  const loadCoaches = async (part = '') => {
    const query = part ? `?part=${encodeURIComponent(part)}` : '';
    setCoaches(await api(`/api/v1/coaches${query}`));
  };

  const loadReviewers = async (part = '') => {
    const query = part ? `?part=${encodeURIComponent(part)}` : '';
    setReviewers(await api(`/api/v1/reviewers${query}`));
  };

  const openDetail = async (targetType, id) => {
    setError('');
    setDetail(null);
    setDetailRef({ targetType, id });
    setView('detail');
    const path = targetType === 'COACH' ? `/api/v1/coaches/${id}` : `/api/v1/reviewers/${id}`;
    setDetail(await api(path));
    await loadHome();
  };

  const refreshDetail = async () => {
    if (detailRef) {
      await openDetail(detailRef.targetType, detailRef.id);
    }
  };

  const openWrite = async () => {
    if (!detailRef) {
      return;
    }
    setTags(await api(`/api/v1/tags?type=${detailRef.targetType}`));
    setView('write');
  };

  const openSearch = async (keyword) => {
    setSearchKeyword(keyword);
    setSearchResults((await api(`/api/v1/search?keyword=${encodeURIComponent(keyword)}`)).results);
    setView('search');
  };

  useEffect(() => {
    Promise.all([loadHome(), loadCoaches(), loadReviewers()]).catch((error) => setError(error.message));
  }, []);

  const handlers = useMemo(() => ({
    goHome: () => setView('home'),
    openList: (targetType) => setView(targetType === 'COACH' ? 'coaches' : 'reviewers'),
    openChat: () => setView('chat')
  }), []);

  return (
    <>
      <Header view={view} goHome={handlers.goHome} openList={handlers.openList} openChat={handlers.openChat} openSearch={openSearch} />
      {error ? <p className="global-error">{error}</p> : null}
      {view === 'home' ? <HomeView home={home} openDetail={openDetail} openSearch={openSearch} openChat={handlers.openChat} /> : null}
      {view === 'coaches' ? <ListView type="COACH" items={currentList} openDetail={openDetail} reload={loadCoaches} /> : null}
      {view === 'reviewers' ? <ListView type="REVIEWER" items={currentList} openDetail={openDetail} reload={loadReviewers} /> : null}
      {view === 'search' ? <SearchView keyword={searchKeyword} results={searchResults} openDetail={openDetail} onSearch={openSearch} /> : null}
      {view === 'detail' ? <DetailView type={detailRef?.targetType} detail={detail} openWrite={openWrite} refreshDetail={refreshDetail} /> : null}
      {view === 'write' ? <WriteReviewView type={detailRef.targetType} target={detail} tags={tags} onCancel={() => setView('detail')} onCreated={refreshDetail} /> : null}
      {view === 'chat' ? <ChatView coaches={coaches} messagesByBot={messagesByBot} setMessagesByBot={setMessagesByBot} /> : null}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
