"use client";

import { toPng } from "html-to-image";
import { Great_Vibes, Playfair_Display } from "next/font/google";
import { useRef, useState, useTransition } from "react";
import {
  carregarAniversariantesMes,
  validarCodigoTurma,
  type AniversariantePublico,
} from "./actions";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "700"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
});

/** Exibe só primeiro e último nome (evita lista longa com vários sobrenomes). */
function nomeCurto(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 2) return partes.join(" ");
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

function slugMes(mesLabel: string) {
  return mesLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AniversariantesMesApp() {
  const [codigo, setCodigo] = useState("");
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [validating, startValidate] = useTransition();
  const [lista, setLista] = useState<AniversariantePublico[] | null>(null);
  const [mesLabel, setMesLabel] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  if (lista === null) {
    return (
      <form
        className="mx-auto max-w-md space-y-4 rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          setCodigoError(null);
          setLoadError(null);
          startValidate(async () => {
            const valid = await validarCodigoTurma(codigo);
            if (valid.error) {
              setCodigoError(valid.error);
              return;
            }
            const res = await carregarAniversariantesMes(codigo);
            if (res.error) {
              setLoadError(res.error);
              return;
            }
            setLista(res.data ?? []);
            setMesLabel(res.mesLabel ?? "");
          });
        }}
      >
        <h2 className="text-base font-semibold text-slate-900">
          Código da turma
        </h2>
        <p className="text-sm text-slate-600">
          Informe o código recebido no WhatsApp para ver os aniversariantes do
          mês.
        </p>
        {(codigoError || loadError) && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {codigoError ?? loadError}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Código *</span>
          <input
            type="text"
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            disabled={validating}
            autoComplete="off"
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
            placeholder="Código da turma"
          />
        </label>
        <button
          type="submit"
          disabled={validating || !codigo.trim()}
          className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {validating ? "Validando…" : "Validar"}
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <ArteAniversariantes lista={lista} mesLabel={mesLabel} />
    </div>
  );
}

function ArteAniversariantes({
  lista,
  mesLabel,
}: {
  lista: AniversariantePublico[];
  mesLabel: string;
}) {
  const arteRef = useRef<HTMLElement>(null);
  const [baixando, setBaixando] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function baixarImagem() {
    const el = arteRef.current;
    if (!el) return;
    setDownloadError(null);
    setBaixando(true);
    try {
      // primeira passagem carrega fontes/imagens; segunda gera o arquivo final
      await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000000",
      });
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      link.download = `aniversariantes-${slugMes(mesLabel) || "mes"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setDownloadError(
        "Não foi possível gerar a imagem. Tente novamente em alguns segundos."
      );
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="space-y-3">
      <article
        ref={arteRef}
        className={`${playfair.className} relative mx-auto w-full overflow-hidden rounded-2xl shadow-2xl aspect-[9/16]`}
      >
        {/* Arte com enfeites: balões, bolo, bolas, confete */}
        <img
          src="/arte-aniversariantes-fundo.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden
          crossOrigin="anonymous"
        />

        <div className="relative z-10 flex h-full flex-col items-center px-4 pt-[3%] text-center sm:px-5">
          <img
            src="/simbolo-turma.png"
            alt="Inimigos do Fim — SCCP"
            className="h-[16%] w-auto max-w-[40%] object-contain drop-shadow-[0_0_12px_rgba(0,0,0,0.45)]"
            crossOrigin="anonymous"
          />

          <p className="mt-1 text-[11px] font-medium text-[#f5d76e] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] sm:text-sm">
            O Inimigos do Fim deseja um
          </p>
          <h2
            className={`${greatVibes.className} text-[clamp(2.1rem,7.5vw,3rem)] leading-tight text-[#f5d76e] drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]`}
          >
            Feliz Aniversário
          </h2>
          <p className="text-[11px] text-[#e8d48b] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] sm:text-sm">
            aos aniversariantes de {mesLabel}
          </p>

          {/* Quadro dinâmico: cresce com a lista; rola só se passar do espaço do bolo */}
          <div className="mt-2 w-[86%] min-h-0 max-h-[42%] shrink overflow-y-auto rounded-xl border-[1.5px] border-[#d4af37] bg-black/70 px-3 py-2 sm:px-4">
            {lista.length === 0 ? (
              <p className="py-2 text-sm text-[#d4c48a]">
                Nenhum aniversariante cadastrado neste mês.
              </p>
            ) : (
              <ul className="text-left">
                {lista.map((p) => (
                  <li
                    key={p.chave}
                    className="py-0.5 text-[13px] font-medium tracking-wide text-[#f7ecc0] sm:text-[15px]"
                  >
                    <span className="text-[#f5d76e]">
                      {String(p.dia).padStart(2, "0")}/
                      {String(p.mes).padStart(2, "0")}
                    </span>
                    <span className="mx-1.5 text-[#c9a227]">—</span>
                    <span>{nomeCurto(p.nome)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* reserva para bolo e velas ficarem abaixo do quadro */}
          <div className="h-[26%] w-full shrink-0" aria-hidden />
        </div>
      </article>

      <div className="flex justify-end px-0.5">
        <button
          type="button"
          onClick={() => void baixarImagem()}
          disabled={baixando}
          title={baixando ? "Gerando imagem…" : "Baixar imagem"}
          aria-label={baixando ? "Gerando imagem" : "Baixar imagem"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-500 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-800 disabled:opacity-50"
        >
          {baixando ? (
            <span className="h-4 w-4 animate-pulse rounded-full border-2 border-slate-300 border-t-slate-600" />
          ) : (
            <DownloadIcon />
          )}
        </button>
      </div>
      {downloadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {downloadError}
        </p>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
