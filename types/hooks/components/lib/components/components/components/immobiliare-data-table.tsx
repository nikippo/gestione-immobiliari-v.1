"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Pencil, Trash2, Check, X, Search, MoreHorizontal, Calendar, Clock } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useDatabase } from "@/hooks/use-database"
import { AnniControllatiDialog } from "@/components/anni-controllati-dialog"
import type { Immobiliare } from "@/types/immobiliare"

export function ImmobiliareDataTable() {
  const router = useRouter()
  const { toast } = useToast()
  const { immobiliari, anniControllo, deleteImmobiliare, updateImmobiliare } = useDatabase()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedImmobiliare, setSelectedImmobiliare] = useState<Immobiliare | null>(null)
  const [showAnniDialog, setShowAnniDialog] = useState(false)
  const [showEstinzioneDialog, setShowEstinzioneDialog] = useState(false)
  const [annoEstinzione, setAnnoEstinzione] = useState("")

  const handleDelete = (id: string) => {
    deleteImmobiliare(id)
    toast({
      title: "Immobiliare eliminata",
      description: "L'immobiliare è stata eliminata con successo",
    })
  }

  const handleToggleControlled = (id: string, currentValue: boolean) => {
    updateImmobiliare(id, { controllato: !currentValue })
  }

  const handleToggleSignaled = (id: string, currentValue: boolean) => {
    updateImmobiliare(id, { segnalazione: !currentValue })
  }

  const openAnniDialog = (immobiliare: Immobiliare) => {
    setSelectedImmobiliare(immobiliare)
    setShowAnniDialog(true)
  }

  const openEstinzioneDialog = (immobiliare: Immobiliare) => {
    setSelectedImmobiliare(immobiliare)
    setAnnoEstinzione(immobiliare.annoEstinzione || "")
    setShowEstinzioneDialog(true)
  }

  const handleSaveEstinzione = () => {
    if (selectedImmobiliare) {
      // Verifica che l'anno sia valido (4 cifre o vuoto)
      if (annoEstinzione && !/^\d{4}$/.test(annoEstinzione)) {
        toast({
          title: "Errore",
          description: "L'anno deve essere nel formato a 4 cifre (es. 2023)",
          variant: "destructive",
        })
        return
      }

      updateImmobiliare(selectedImmobiliare.id, {
        annoEstinzione: annoEstinzione || undefined,
      })

      toast({
        title: "Anno di estinzione aggiornato",
        description: annoEstinzione ? `Anno di estinzione impostato a ${annoEstinzione}` : "Anno di estinzione rimosso",
      })

      setShowEstinzioneDialog(false)
    }
  }

  const filteredData = immobiliari.filter(
    (item) =>
      item.codiceFiscale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.denominazione.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comune.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Ottieni gli anni attivi per la visualizzazione
  const activeYears = anniControllo.filter((anno) => anno.attivo).sort((a, b) => a.anno.localeCompare(b.anno))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Cerca per codice fiscale, denominazione o comune..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Codice Fiscale/P.IVA</TableHead>
              <TableHead className="whitespace-nowrap">Denominazione</TableHead>
              <TableHead className=
