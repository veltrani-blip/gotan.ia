"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";

import {
  DesktopIcon,
  DownloadIcon,
  MicIcon,
  MobileIcon,
  SendIcon,
} from "./icons";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import {
  projectFilesToRecord,
  type GeneratedProject,
} from "@/lib/project";

import {
  buildProjectZip,
  isZipAvailable,
  zipFileName,
} from "@/lib/zip";

type RequestState =
  | "idle"
  | "requesting"
  | "validating"
  | "ready"
  | "patching"
  | "error"
  | "cancelled";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Falha inesperada.";
}

async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const data = (await response.json()) as T & {
    error?: string;
    details?: string;
  };

  if (!response.ok) {
    throw new Error(
      data.details ||
        data.error ||
        `Erro HTTP ${response.status}`,
    );
  }

  return data;
}

export function VoiceBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPrompt =
    searchParams.get("prompt")?.trim() || "";

  const startedRef = useRef(false);
  const mountedRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const [project, setProject] =
    useState<GeneratedProject | null>(null);

  const [selectedPath, setSelectedPath] =
    useState("src/App.tsx");

  const [activeTab, setActiveTab] =
    useState<"preview" | "code">("preview");

  const [viewport, setViewport] =
    useState<"desktop" | "mobile">("desktop");

  const [state, setState] =
    useState<RequestState>("idle");

  const [error, setError] =
    useState<string | null>(null);

  const [instruction, setInstruction] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      initialPrompt
        ? [{ role: "user", text: initialPrompt }]
        : [],
    );

  const appendVoice = useCallback((text: string) => {
    setInstruction((current) =>
      `${current}${current.trim() ? " " : ""}${text}`,
    );
  }, []);

  const voice = useSpeechRecognition(appendVoice);

  const persist = useCallback(
    (nextProject: GeneratedProject) => {
      setProject(nextProject);

      localStorage.setItem(
        "gotan:voice-project",
        JSON.stringify(nextProject),
      );

      if (
        !nextProject.files.some(
          (file) => file.path === selectedPath,
        )
      ) {
        setSelectedPath(
          nextProject.files[0]?.path || "src/App.tsx",
        );
      }
    },
    [selectedPath],
  );

  const generate = useCallback(
    async (prompt: string) => {
      const normalized = prompt.trim();

      if (normalized.length < 8) {
        setState("error");
        setError(
          "Descreva melhor o aplicativo antes de gerar.",
        );
        return;
      }

      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setState("requesting");
      setError(null);

      try {
        const response = await fetch(
          "/api/projects/generate",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              prompt: normalized,
            }),
            signal: controller.signal,
          },
        );

        setState("validating");

        const result =
          await readJsonResponse<GeneratedProject>(
            response,
          );

        persist(result);

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: `${result.summary} O projeto foi gerado com ${result.files.length} arquivos reais.`,
          },
        ]);

        setState("ready");
        setActiveTab("preview");
      } catch (requestError) {
        if (controller.signal.aborted) {
          setState("cancelled");
          setError("Geração cancelada.");
        } else {
          setState("error");
          setError(errorMessage(requestError));
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [persist],
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      window.setTimeout(() => {
        if (!mountedRef.current) {
          abortRef.current?.abort();
        }
      }, 0);
    };
  }, []);

  useEffect(() => {
    if (startedRef.current) return;

    startedRef.current = true;

    const saved = localStorage.getItem(
      "gotan:voice-project",
    );

    if (!initialPrompt && saved) {
      try {
        persist(
          JSON.parse(saved) as GeneratedProject,
        );

        setState("ready");
        return;
      } catch {
        localStorage.removeItem(
          "gotan:voice-project",
        );
      }
    }

    if (initialPrompt) {
      void generate(initialPrompt);
      return;
    }

    setState("idle");
  }, [generate, initialPrompt, persist]);

  const sendPatch = async () => {
    const text = instruction.trim();

    if (
      !project ||
      !text ||
      state === "patching" ||
      state === "requesting" ||
      state === "validating"
    ) {
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text,
      },
    ]);

    setInstruction("");
    setState("patching");
    setError(null);

    try {
      const response = await fetch(
        "/api/projects/patch",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            project,
            instruction: text,
          }),
          signal: controller.signal,
        },
      );

      const updated =
        await readJsonResponse<GeneratedProject>(
          response,
        );

      persist(updated);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Alteração aplicada. ${updated.summary}`,
        },
      ]);

      setState("ready");
      setActiveTab("preview");
    } catch (requestError) {
      if (controller.signal.aborted) {
        setState("cancelled");
        setError("Alteração cancelada.");
      } else {
        setState("error");
        setError(errorMessage(requestError));
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  const selectedFile =
    project?.files.find(
      (file) => file.path === selectedPath,
    ) || null;

  const sandpackFiles = useMemo(
    () =>
      project
        ? projectFilesToRecord(project.files)
        : {},
    [project],
  );

  const updateSelectedFile = (
    content: string,
  ) => {
    if (!project || !selectedFile) return;

    persist({
      ...project,
      files: project.files.map((file) =>
        file.path === selectedFile.path
          ? {
              ...file,
              content,
            }
          : file,
      ),
    });
  };

  const download = async () => {
    if (
      !project ||
      !isZipAvailable(
        state,
        project.files.length,
      )
    ) {
      return;
    }

    try {
      setError(null);

      const data =
        await buildProjectZip(project);

      const arrayBuffer = new ArrayBuffer(
        data.byteLength,
      );

      new Uint8Array(arrayBuffer).set(data);

      const blob = new Blob(
        [arrayBuffer],
        {
          type: "application/zip",
        },
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = zipFileName(
        project.projectName,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(errorMessage(downloadError));
    }
  };

  const busy =
    state === "requesting" ||
    state === "validating" ||
    state === "patching";

  const honestStatus =
    state === "requesting"
      ? "Enviando o prompt ao modelo…"
      : state === "validating"
        ? "Validando os arquivos recebidos…"
        : state === "patching"
          ? "Enviando a alteração e aguardando resposta…"
          : null;

  const canDownload = isZipAvailable(
    state,
    project?.files.length ?? 0,
  );

  return (
    <main className="builder">
      <header className="builder-header">
        <div className="builder-brand">
          <Image
            src="/branding/gotan-logo.png"
            alt="gotan.ia"
            width={180}
            height={54}
            priority
          />

          <div className="project-title">
            <strong>
              {project?.projectName ||
                "Novo projeto"}
            </strong>

            <small>
              {" "}
              / builder de voz
            </small>
          </div>
        </div>

        <div className="builder-actions">
          {busy && (
            <button
              className="icon-button"
              type="button"
              style={{
                padding: "9px 13px",
              }}
              onClick={() =>
                abortRef.current?.abort()
              }
            >
              Cancelar
            </button>
          )}

          <button
            className="icon-button"
            type="button"
            style={{
              padding: "9px 13px",
            }}
            onClick={() => {
              localStorage.removeItem(
                "gotan:voice-project",
              );

              router.push("/");
            }}
          >
            Sair
          </button>

          <button
            className="gradient-button"
            type="button"
            disabled={!canDownload}
            style={{
              padding: "10px 15px",
              borderRadius: 11,
              cursor: canDownload
                ? "pointer"
                : "not-allowed",
              fontWeight: 800,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
            onClick={() => void download()}
          >
            <DownloadIcon width={17} />
            Baixar ZIP
          </button>
        </div>
      </header>

      <section className="builder-grid">
        <aside className="panel chat-panel">
          <div className="panel-title">
            Gotan

            <span
              style={{
                color: "var(--muted-2)",
                marginLeft: 7,
                fontWeight: 500,
              }}
            >
              assistente
            </span>
          </div>

          <div className="chat-scroll">
            {messages.map(
              (message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${
                    message.role === "user"
                      ? "user"
                      : ""
                  }`}
                >
                  {message.text}
                </div>
              ),
            )}

            {honestStatus && (
              <div className="real-status">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span className="spinner" />

                  <strong>
                    {honestStatus}
                  </strong>
                </div>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "var(--muted)",
                    fontSize: 13,
                  }}
                >
                  Sem porcentagem ou etapas
                  simuladas. O painel aguarda a
                  resposta real.
                </p>
              </div>
            )}

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}
          </div>

          <div className="chat-input">
            <textarea
              value={instruction}
              onChange={(event) =>
                setInstruction(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  void sendPatch();
                }
              }}
              placeholder={
                project
                  ? "Peça uma alteração…"
                  : "Aguarde a geração…"
              }
              disabled={!project || busy}
            />

            <button
              className={`icon-button ${
                voice.listening
                  ? "mic-live"
                  : ""
              }`}
              type="button"
              disabled={
                !project ||
                busy ||
                !voice.supported
              }
              style={{
                width: 44,
                height: 44,
              }}
              title="Ditado por voz"
              onClick={voice.toggle}
            >
              <MicIcon width={20} />
            </button>

            <button
              className="gradient-button"
              type="button"
              disabled={
                !project ||
                busy ||
                !instruction.trim()
              }
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                cursor: "pointer",
              }}
              title="Enviar alteração"
              onClick={() =>
                void sendPatch()
              }
            >
              <SendIcon width={18} />
            </button>
          </div>
        </aside>

        <aside className="panel file-panel">
          <div className="panel-title">
            Arquivos
          </div>

          <div
            style={{
              padding: "8px 0",
            }}
          >
            {project?.files.map((file) => (
              <button
                key={file.path}
                className={`file-button ${
                  file.path === selectedPath
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() => {
                  setSelectedPath(file.path);
                  setActiveTab("code");
                }}
              >
                {file.path}
              </button>
            ))}
          </div>
        </aside>

        <section className="workspace">
          <div className="workspace-toolbar">
            <div className="tabs">
              <button
                className={`tab-button ${
                  activeTab === "preview"
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() =>
                  setActiveTab("preview")
                }
              >
                Pré-visualizar
              </button>

              <button
                className={`tab-button ${
                  activeTab === "code"
                    ? "active"
                    : ""
                }`}
                type="button"
                onClick={() =>
                  setActiveTab("code")
                }
              >
                Código
              </button>
            </div>

            <div className="viewport-tools">
              <button
                className={`tab-button ${
                  viewport === "desktop"
                    ? "active"
                    : ""
                }`}
                type="button"
                title="Desktop"
                onClick={() =>
                  setViewport("desktop")
                }
              >
                <DesktopIcon width={17} />
              </button>

              <button
                className={`tab-button ${
                  viewport === "mobile"
                    ? "active"
                    : ""
                }`}
                type="button"
                title="Mobile"
                onClick={() =>
                  setViewport("mobile")
                }
              >
                <MobileIcon width={17} />
              </button>
            </div>
          </div>

          <div className="workspace-body">
            {!project && busy && (
              <div className="empty-state">
                <div>
                  <span
                    className="spinner"
                    style={{
                      display: "inline-block",
                    }}
                  />

                  <h2>
                    Gerando projeto real
                  </h2>

                  <p>
                    {honestStatus ||
                      "Aguardando resposta real da API."}
                  </p>
                </div>
              </div>
            )}

            {!project &&
              state === "error" && (
                <div className="empty-state">
                  <div>
                    <h2>
                      Não foi possível gerar o
                      projeto
                    </h2>

                    <p>
                      {error ||
                        "A API retornou um erro."}
                    </p>

                    <button
                      className="gradient-button"
                      type="button"
                      style={{
                        marginTop: 18,
                        padding: "11px 18px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                      onClick={() =>
                        void generate(
                          initialPrompt,
                        )
                      }
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              )}

            {!project &&
              state === "cancelled" && (
                <div className="empty-state">
                  <div>
                    <h2>
                      Geração cancelada
                    </h2>

                    <p>
                      Seu prompt foi preservado.
                      Você pode tentar novamente.
                    </p>

                    <button
                      className="gradient-button"
                      type="button"
                      style={{
                        marginTop: 18,
                        padding: "11px 18px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                      onClick={() =>
                        void generate(
                          initialPrompt,
                        )
                      }
                    >
                      Gerar novamente
                    </button>
                  </div>
                </div>
              )}

            {!project &&
              state === "idle" && (
                <div className="empty-state">
                  <div>
                    <h2>
                      Nenhum projeto iniciado
                    </h2>

                    <p>
                      Volte à página inicial e
                      descreva o aplicativo que
                      deseja criar.
                    </p>

                    <button
                      className="gradient-button"
                      type="button"
                      style={{
                        marginTop: 18,
                        padding: "11px 18px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontWeight: 800,
                      }}
                      onClick={() =>
                        router.push("/")
                      }
                    >
                      Voltar ao início
                    </button>
                  </div>
                </div>
              )}

            {project &&
              activeTab === "code" &&
              selectedFile && (
                <textarea
                  className="code-editor"
                  spellCheck={false}
                  value={selectedFile.content}
                  onChange={(event) =>
                    updateSelectedFile(
                      event.target.value,
                    )
                  }
                  aria-label={`Código de ${selectedFile.path}`}
                />
              )}

            {project &&
              activeTab === "preview" && (
                <div className="preview-wrap">
                  <div
                    className={`preview-frame ${
                      viewport === "mobile"
                        ? "mobile"
                        : ""
                    }`}
                  >
                    <SandpackProvider
                      template="vite"
                      files={sandpackFiles}
                      options={{
                        activeFile: `/${selectedPath}`,
                        visibleFiles:
                          project.files.map(
                            (file) =>
                              `/${file.path}`,
                          ),
                        recompileMode:
                          "delayed",
                        recompileDelay: 500,
                      }}
                    >
                      <SandpackPreview
                        style={{
                          height: "100%",
                        }}
                        showOpenInCodeSandbox={
                          false
                        }
                        showRefreshButton
                      />
                    </SandpackProvider>
                  </div>
                </div>
              )}
          </div>
        </section>
      </section>
    </main>
  );
}
