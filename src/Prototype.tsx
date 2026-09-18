import {
  ArrowLeftIcon,
  CalendarIcon,
  CameraIcon,
  CheckCircledIcon,
  DownloadIcon,
  IdCardIcon,
  InfoCircledIcon,
  SewingPinFilledIcon,
} from "@radix-ui/react-icons";
import { toBlob } from "html-to-image";
import {
  type ChangeEvent,
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { KeyboardInput, KeyboardTextarea, MobileScroll, useKeyboard } from "./mobile";

type CardData = {
  name: string;
  age: string;
  missingAt: string;
  location: string;
  description: string;
  checkedAt: string;
  author: string;
};

const sampleData: CardData = {
  name: "김○○",
  age: "72세",
  missingAt: "9월 19일 오전 6:20",
  location: "오산역 2번 출구 인근",
  description: "회색 점퍼 · 검정 바지 · 빨간 운동화",
  checkedAt: "2026.09.19 09:10",
  author: "가족 작성",
};

const samplePhoto = `${import.meta.env.BASE_URL}sample-person.webp`;

export default function Prototype() {
  const [screen, setScreen] = useState<"preview" | "edit">("preview");
  const [data, setData] = useState<CardData>(sampleData);
  const [photo, setPhoto] = useState(samplePhoto);
  const [isSamplePhoto, setIsSamplePhoto] = useState(true);
  const [notice, setNotice] = useState("이미지는 이 기기에서만 생성됩니다.");
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const keyboard = useKeyboard();

  useLayoutEffect(() => {
    const deviceScreen = document.querySelector<HTMLElement>("[data-phone-screen]");
    if (deviceScreen) deviceScreen.scrollTop = 0;
  }, [screen]);

  const openEditor = () => {
    keyboard.hide();
    setScreen("edit");
    setNotice("이미지는 이 기기에서만 생성됩니다.");
  };

  const showPreview = () => {
    keyboard.hide();
    setData((current) => ({ ...current, checkedAt: formatCheckedAt(new Date()) }));
    setScreen("preview");
  };

  const updateField = (field: keyof CardData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setNotice("사진은 15MB 이하로 선택해 주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setPhoto(reader.result);
      setIsSamplePhoto(false);
      setNotice("사진을 불러왔습니다. 서버로 전송되지 않습니다.");
    };
    reader.onerror = () => setNotice("사진을 읽지 못했습니다. 다시 선택해 주세요.");
    reader.readAsDataURL(file);
  };

  const exportCard = async () => {
    if (!cardRef.current || isExporting) return;

    setIsExporting(true);
    setNotice("공유 이미지를 만드는 중입니다…");

    try {
      await document.fonts.ready;
      const blob = await toBlob(cardRef.current, {
        backgroundColor: "#fffdf8",
        cacheBust: true,
        pixelRatio: 3,
      });

      if (!blob) throw new Error("카드 이미지를 만들지 못했습니다.");

      const safeName = data.name.replace(/[^0-9A-Za-z가-힣_-]/g, "") || "실종자";
      const file = new File([blob], `${safeName}-찾기카드.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "실종자를 찾습니다",
          text: `${data.name}님을 찾고 있습니다. 목격하셨다면 112로 알려주세요.`,
        });
        setNotice("공유 화면을 열었습니다.");
      } else {
        downloadBlob(file);
        setNotice("PNG 이미지를 저장했습니다.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("공유를 취소했습니다. 이미지는 저장되지 않았습니다.");
      } else {
        setNotice("이미지를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  if (screen === "edit") {
    return (
      <MobileScroll className="app-screen" key="edit-screen">
        <main className="screen-content edit-screen" aria-labelledby="edit-title">
          <AppHeader title="실종자 정보 입력" titleId="edit-title" onBack={showPreview} />

          <section className="privacy-banner" aria-label="개인정보 안내">
            <InfoCircledIcon aria-hidden="true" />
            <p>입력한 정보와 사진은 서버에 저장하거나 전송하지 않습니다.</p>
          </section>

          <div className="photo-picker-row">
            <div className="photo-thumb">
              <img src={photo} alt="카드에 들어갈 인물 사진" draggable={false} />
            </div>
            <div>
              <strong>인물 사진</strong>
              <p>얼굴이 선명한 최근 사진을 사용해 주세요.</p>
              <label className="photo-button" htmlFor="person-photo">
                <CameraIcon aria-hidden="true" /> 사진 선택
              </label>
              <input
                className="visually-hidden"
                id="person-photo"
                type="file"
                accept="image/*"
                onChange={handlePhoto}
              />
            </div>
          </div>

          <div className="form-grid">
            <TextField
              id="name"
              label="이름 또는 공개 이름"
              value={data.name}
              placeholder="예: 김○○"
              onChange={(value) => updateField("name", value)}
            />
            <TextField
              id="age"
              label="나이"
              value={data.age}
              placeholder="예: 72세"
              onChange={(value) => updateField("age", value)}
            />
            <TextField
              id="missing-at"
              label="마지막 목격 시각"
              value={data.missingAt}
              placeholder="예: 9월 19일 오전 6:20"
              onChange={(value) => updateField("missingAt", value)}
            />
            <TextField
              id="location"
              label="마지막 목격 장소"
              value={data.location}
              placeholder="예: 오산역 2번 출구 인근"
              onChange={(value) => updateField("location", value)}
            />
            <label className="field full-field" htmlFor="description">
              <span>인상착의</span>
              <KeyboardTextarea
                id="description"
                rows={3}
                value={data.description}
                placeholder="옷차림, 신발, 특징을 적어 주세요."
                onChange={(event) => updateField("description", event.target.value)}
                onBlur={() => keyboard.hide()}
              />
            </label>
            <TextField
              id="author"
              label="작성 주체"
              value={data.author}
              placeholder="예: 가족 작성"
              onChange={(value) => updateField("author", value)}
            />
          </div>

          <p className="form-note">
            사실로 확인된 정보만 입력해 주세요. 긴급한 상황은 먼저 112에 신고하세요.
          </p>

          <button className="primary-button form-submit" type="button" onClick={showPreview}>
            <CheckCircledIcon aria-hidden="true" /> 공유 카드 확인
          </button>
        </main>
      </MobileScroll>
    );
  }

  return (
    <MobileScroll className="app-screen" key="preview-screen">
      <main className="screen-content preview-screen" aria-labelledby="preview-title">
        <AppHeader title="공유 카드 확인" titleId="preview-title" onBack={openEditor} />

        <MissingCard
          cardRef={cardRef}
          data={data}
          photo={photo}
          isSamplePhoto={isSamplePhoto}
        />

        <div className="actions" aria-label="카드 작업">
          <button className="secondary-button" type="button" onClick={openEditor}>
            정보 수정
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={exportCard}
            disabled={isExporting}
          >
            <DownloadIcon aria-hidden="true" />
            {isExporting ? "이미지 생성 중…" : "이미지 저장·공유"}
          </button>
        </div>

        <p className="local-only" role="status" aria-live="polite">
          {notice}
        </p>
      </main>
    </MobileScroll>
  );
}

function AppHeader({
  title,
  titleId,
  onBack,
}: {
  title: string;
  titleId: string;
  onBack: () => void;
}) {
  return (
    <header className="app-header">
      <button className="icon-button" type="button" onClick={onBack} aria-label="뒤로 가기">
        <ArrowLeftIcon aria-hidden="true" />
      </button>
      <h1 id={titleId}>{title}</h1>
      <span className="header-spacer" aria-hidden="true" />
    </header>
  );
}

function MissingCard({
  cardRef,
  data,
  photo,
  isSamplePhoto,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  data: CardData;
  photo: string;
  isSamplePhoto: boolean;
}) {
  return (
    <div className="missing-card" ref={cardRef} data-testid="missing-card">
      <div className="card-alert">실종자를 찾습니다</div>
      <div className="card-body">
        <div className="card-photo-wrap">
          <img className="card-photo" src={photo} alt="" draggable={false} />
          {isSamplePhoto && <span className="sample-label">예시 인물</span>}
        </div>
        <div className="card-details">
          <div className="person-name">
            <strong>{data.name || "이름 미입력"}</strong>
            <span>·</span>
            <strong>{data.age || "나이 미입력"}</strong>
          </div>
          <CardFact icon={<CalendarIcon />} text={data.missingAt || "목격 시각 미입력"} />
          <CardFact icon={<SewingPinFilledIcon />} text={data.location || "목격 장소 미입력"} />
          <CardFact icon={<IdCardIcon />} text={data.description || "인상착의 미입력"} />
        </div>
      </div>
      <div className="card-callout">
        <span>목격하셨다면</span>
        <strong>112</strong>
        <span>로 알려주세요</span>
      </div>
      <div className="card-meta">정보 확인 {data.checkedAt} · {data.author}</div>
    </div>
  );
}

function CardFact({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="card-fact">
      <span className="fact-icon" aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const keyboard = useKeyboard();

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <KeyboardInput
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => keyboard.hide()}
      />
    </label>
  );
}

function downloadBlob(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function formatCheckedAt(date: Date) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}.${value("month")}.${value("day")} ${value("hour")}:${value("minute")}`;
}
