"use client";

import { ExcluirComSenhaDialog } from "@/components/excluir-com-senha-dialog";
import { excluirMaterial } from "./actions";
import { EditarMaterialDialog } from "./editar-material-dialog";

type MaterialRow = {
  id: string;
  nome: string;
  descricao: string | null;
  quantidade: number;
};

export function MaterialRowActions({ material }: { material: MaterialRow }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <EditarMaterialDialog material={material} />
      <ExcluirComSenhaDialog
        titulo="Excluir material"
        descricao={`Confirme com sua senha para excluir "${material.nome}". O registro ficará no histórico de auditoria.`}
        onConfirm={(password) => excluirMaterial(material.id, password)}
      />
    </div>
  );
}
