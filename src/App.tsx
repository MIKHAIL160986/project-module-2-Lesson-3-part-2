import { useMemo, useRef, useState } from 'react'
import { useAppState } from './hooks/useAppState'
import { SummaryCards } from './components/SummaryCards'
import { SearchAndFilters, type FilterMode } from './components/SearchAndFilters'
import { ParticipantForm } from './components/ParticipantForm'
import { ParticipantTable } from './components/ParticipantTable'
import { PaymentModal } from './components/PaymentModal'
import { PaymentHistory } from './components/PaymentHistory'
import { ConfirmDialog } from './components/ConfirmDialog'
import { EditParticipantModal } from './components/EditParticipantModal'
import { computeAllParticipants } from './utils/participantLogic'
import { exportToCsv, importFromCsv, importFromJson } from './utils/csv'
import { exportToExcelBlob } from './utils/excelExport'
import type { ParticipantComputed, Payment } from './types'

type DeleteTarget =
  | { kind: 'participant'; id: string }
  | { kind: 'payment'; id: string }
  | null

export function App() {
  const {
    data,
    setSettings,
    importFull,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addPayment,
    updatePayment,
    deletePayment,
  } = useAppState()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentParticipantId, setPaymentParticipantId] = useState<string | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const [historyParticipantId, setHistoryParticipantId] = useState<string | null>(null)

  const [editParticipant, setEditParticipant] = useState<ParticipantComputed | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const computed = useMemo(
    () => computeAllParticipants(data.participants, data.payments),
    [data.participants, data.payments]
  )

  const filtered = useMemo(() => {
    let list = computed
    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.lastName.toLowerCase().includes(q))
    if (filter !== 'all') list = list.filter((p) => p.status === filter)
    return list
  }, [computed, query, filter])

  const historyParticipant = useMemo(
    () => data.participants.find((p) => p.id === historyParticipantId) ?? null,
    [data.participants, historyParticipantId]
  )

  const handleExportCsv = () => {
    const blob = new Blob([exportToCsv(data)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `сбор-участники-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    const blob = exportToExcelBlob(data)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `сбор-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `сбор-резерв-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    const text = await file.text()
    const normalized = text.replace(/^\uFEFF/, '')
    const trimmed = normalized.trim()
    const next = trimmed.startsWith('{')
      ? importFromJson(trimmed)
      : importFromCsv(normalized)
    if (!next) {
      alert('Не удалось разобрать файл. Проверьте формат CSV или JSON.')
      return
    }
    const ok = window.confirm(
      'Импорт заменит текущие данные в приложении. Продолжить?'
    )
    if (!ok) return
    importFull({
      ...next,
      settings: {
        currency: next.settings.currency || data.settings.currency,
        defaultAmount: next.settings.defaultAmount ?? data.settings.defaultAmount,
      },
    })
  }

  const openPayment = (participantId: string) => {
    setEditingPayment(null)
    setPaymentParticipantId(participantId)
    setPaymentModalOpen(true)
  }

  const closePaymentModal = () => {
    setPaymentModalOpen(false)
    setPaymentParticipantId(null)
    setEditingPayment(null)
  }

  const savePayment = (pay: Omit<Payment, 'id'>) => {
    if (editingPayment) {
      updatePayment(editingPayment.id, pay)
    } else {
      addPayment(pay)
    }
    closePaymentModal()
  }

  const requestDeleteParticipant = (id: string) => {
    setDeleteTarget({ kind: 'participant', id })
  }

  const requestDeletePayment = (pay: Payment) => {
    setDeleteTarget({ kind: 'payment', id: pay.id })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.kind === 'participant') {
      deleteParticipant(deleteTarget.id)
    } else {
      deletePayment(deleteTarget.id)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Учёт сбора средств
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Локальные данные в браузере. Валюту и сумму по умолчанию можно изменить ниже.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col text-xs font-medium text-slate-600">
            Валюта
            <input
              value={data.settings.currency}
              onChange={(e) => setSettings({ currency: e.target.value })}
              className="mt-1 w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Экспорт CSV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="rounded-xl bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
              Экспорт Excel
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="rounded-xl bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Экспорт JSON
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Импорт
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt,text/csv,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) void handleImportFile(f)
              }}
            />
          </div>
        </div>
      </header>

      <section className="mb-8">
        <SummaryCards participants={computed} currency={data.settings.currency} />
      </section>

      <section className="mb-6 space-y-4">
        <SearchAndFilters
          query={query}
          onQueryChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
        />
        <ParticipantForm
          defaultAmount={data.settings.defaultAmount}
          onDefaultAmountChange={(n) => setSettings({ defaultAmount: n })}
          onSubmitParticipant={(p) => addParticipant(p)}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Участники</h2>
        <ParticipantTable
          rows={filtered}
          currency={data.settings.currency}
          onAddPayment={openPayment}
          onOpenHistory={(id) => setHistoryParticipantId(id)}
          onEditParticipant={(p) => setEditParticipant(p)}
          onDeleteParticipant={requestDeleteParticipant}
        />
      </section>

      <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
        Данные хранятся только в этом браузере (localStorage).
      </div>

      <PaymentModal
        open={paymentModalOpen}
        currency={data.settings.currency}
        participants={data.participants}
        payments={data.payments}
        initialParticipantId={paymentParticipantId}
        editingPayment={editingPayment}
        onClose={closePaymentModal}
        onSave={savePayment}
      />

      <PaymentHistory
        open={historyParticipantId !== null}
        participant={historyParticipant}
        payments={data.payments}
        currency={data.settings.currency}
        onClose={() => setHistoryParticipantId(null)}
        onEdit={(pay) => {
          setHistoryParticipantId(null)
          setEditingPayment(pay)
          setPaymentParticipantId(pay.participantId)
          setPaymentModalOpen(true)
        }}
        onDelete={(pay) => requestDeletePayment(pay)}
      />

      <EditParticipantModal
        open={editParticipant !== null}
        participant={editParticipant}
        onClose={() => setEditParticipant(null)}
        onSave={(id, fields) => updateParticipant(id, fields)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.kind === 'participant' ? 'Удалить участника?' : 'Удалить платёж?'
        }
        message={
          deleteTarget?.kind === 'participant'
            ? 'Участник и все его платежи будут удалены без восстановления.'
            : 'Платёж будет удалён. Суммы у участника пересчитаются автоматически.'
        }
        confirmLabel="Удалить"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
