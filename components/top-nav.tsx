"use client"

import { Bell, Search, ChevronDown, Plus, Pencil, Trash2, Check } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  addMember,
  deleteMember,
  ensureActiveMemberId,
  getStoredMemberId,
  isDefaultMember,
  listMembers,
  Member,
  setStoredMemberId,
  updateMember,
} from "@/lib/member"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const navItems = [
  { id: "qa", label: "健康问答" },
  { id: "dashboard", label: "健康仪表盘" },
  { id: "events", label: "健康事件" },
  { id: "plans", label: "健康计划" },
]

interface TopNavProps {
  activeNav: string
  onNavChange: (id: string) => void
}

export function TopNav({ activeNav, onNavChange }: TopNavProps) {
  const [showMemberMenu, setShowMemberMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [activeMemberId, setActiveMemberId] = useState<number | null>(
    getStoredMemberId()
  )
  const [membersLoading, setMembersLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [savingMember, setSavingMember] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deletingMember, setDeletingMember] = useState(false)
  const [memberForm, setMemberForm] = useState({
    nickname: "",
    sex: "",
    birthday: "",
    heightCm: "",
    weightKg: "",
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const loadMembers = async () => {
      setMembersLoading(true)
      setListError(null)
      try {
        const ensuredId = await ensureActiveMemberId()
        const list = await listMembers()
        setMembers(list)
        const storedId = getStoredMemberId()
        const nextActive =
          (ensuredId && list.some((member) => member.id === ensuredId) && ensuredId) ||
          (storedId && list.some((member) => member.id === storedId) && storedId) ||
          list[0]?.id ||
          null
        setActiveMemberId(nextActive)
        if (nextActive) setStoredMemberId(nextActive)
      } catch (error) {
        setListError("成员加载失败，请稍后重试")
      } finally {
        setMembersLoading(false)
      }
    }

    void loadMembers()
  }, [])

  const activeMember = members.find((member) => member.id === activeMemberId) || null
  const activeMemberLabel = activeMember?.nickname?.trim() || "未选择成员"
  const editingIsDefault = editingMember ? isDefaultMember(editingMember) : false

  const openEditor = (member: Member | null) => {
    setEditingMember(member)
    setSaveError(null)
    setMemberForm({
      nickname: member?.nickname ?? "",
      sex: member?.sex ?? "",
      birthday: member?.birthday ?? "",
      heightCm: member?.heightCm ? String(member.heightCm) : "",
      weightKg: member?.weightKg ? String(member.weightKg) : "",
    })
    setEditorOpen(true)
  }

  const handleSelectMember = (memberId: number) => {
    setActiveMemberId(memberId)
    setStoredMemberId(memberId)
    setShowMemberMenu(false)
  }

  const refreshMembers = async (preferredNickname?: string, preferredId?: number) => {
    setMembersLoading(true)
    setListError(null)
    try {
      const ensuredId = await ensureActiveMemberId()
      const list = await listMembers()
      setMembers(list)
      let nextActive = preferredId ?? activeMemberId
      if (!nextActive && preferredNickname) {
        nextActive = list.find((member) => member.nickname === preferredNickname)?.id ?? null
      }
      if (!nextActive && ensuredId) {
        nextActive = ensuredId
      }
      if (nextActive && !list.some((member) => member.id === nextActive)) {
        nextActive = list[0]?.id ?? null
      }
      setActiveMemberId(nextActive)
      if (nextActive) setStoredMemberId(nextActive)
    } catch (error) {
      setListError("成员加载失败，请稍后重试")
    } finally {
      setMembersLoading(false)
    }
  }

  const handleSaveMember = async () => {
    const nickname = memberForm.nickname.trim()
    if (!nickname) return

    setSavingMember(true)
    setSaveError(null)
    try {
      const payload = {
        nickname,
        sex: memberForm.sex ? (memberForm.sex as "m" | "f") : undefined,
        birthday: memberForm.birthday || undefined,
        heightCm: memberForm.heightCm ? Number(memberForm.heightCm) : undefined,
        weightKg: memberForm.weightKg ? Number(memberForm.weightKg) : undefined,
      }

      if (editingMember?.id) {
        await updateMember({ id: editingMember.id, ...payload })
        setEditorOpen(false)
        void refreshMembers(undefined, editingMember.id)
      } else {
        await addMember(payload)
        setEditorOpen(false)
        void refreshMembers(nickname)
      }
    } catch (error) {
      setSaveError("成员保存失败，请稍后重试")
    } finally {
      setSavingMember(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!editingMember?.id) return
    if (isDefaultMember(editingMember)) {
      setSaveError("默认成员不可删除")
      return
    }
    setDeletingMember(true)
    setSaveError(null)
    try {
      await deleteMember(editingMember.id)
      const nextActive =
        activeMemberId === editingMember.id
          ? members.find((member) => member.id !== editingMember.id)?.id ?? null
          : activeMemberId
      setEditorOpen(false)
      setDeleteConfirmOpen(false)
      void refreshMembers(undefined, nextActive ?? undefined)
    } catch (error) {
      setSaveError("成员删除失败，请稍后重试")
    } finally {
      setDeletingMember(false)
    }
  }

  return (
    <header className="relative z-50 flex h-14 items-center justify-between border-b border-border/60 bg-white px-5 dark:bg-card">
      {/* Left: Member Switcher */}
      <div className="relative flex items-center gap-3">
        <button
          onClick={() => setShowMemberMenu(!showMemberMenu)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/80 text-sm font-medium text-white">
            {(activeMember?.nickname?.[0] ?? "M").toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground">{activeMemberLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {showMemberMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMemberMenu(false)} />
            <div className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-border/50 bg-white p-2 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
              <div className="flex items-center justify-between px-2 pb-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground">成员</span>
                <button
                  onClick={() => {
                    setShowMemberMenu(false)
                    openEditor(null)
                  }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  添加成员
                </button>
              </div>

              {membersLoading ? (
                <div className="px-3 py-4 text-xs text-muted-foreground">正在加载...</div>
              ) : members.length === 0 ? (
                <div className="px-3 py-4 text-xs text-muted-foreground">
                  暂无成员，请先添加
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <button
                        onClick={() => handleSelectMember(member.id)}
                        className="flex flex-1 items-center gap-2.5 text-left"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/60 text-xs font-medium text-white">
                          {(member.nickname?.[0] ?? "M").toUpperCase()}
                        </div>
                        <span className="flex-1 truncate">{member.nickname || "未命名成员"}</span>
                        {member.id === activeMemberId && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowMemberMenu(false)
                          openEditor(member)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-primary/10"
                        aria-label="编辑成员"
                      >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {listError && (
                <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {listError}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Center: Nav Links */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={cn(
              "relative rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeNav === item.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
            {activeNav === item.id && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </nav>

      {/* Right: Notification + Search */}
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border/50 bg-white p-2 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground">通知</p>
                <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm text-foreground">妈妈的体检报告已解析完成</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">2 分钟前</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm text-foreground">请问爸爸今天血压情况如何</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">1 小时前</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <Search className="h-[18px] w-[18px] text-muted-foreground" />
          </button>

          {showSearch && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSearch(false)} />
              <div className="absolute right-0 top-full z-50 mt-1.5 w-80 rounded-xl border border-border/50 bg-white p-1 shadow-lg shadow-foreground/[0.08] dark:bg-[hsl(222,20%,14%)]">
                <div className="flex items-center gap-2 px-3 py-1">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="搜索对话记录..."
                    className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "编辑成员" : "添加成员"}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? "更新成员信息，保存后将同步到健康问答。"
                : "新增成员后，可以为每位家庭成员分别提问。"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">昵称</label>
              <input
                value={memberForm.nickname}
                onChange={(e) =>
                  setMemberForm((prev) => ({ ...prev, nickname: e.target.value }))
                }
                placeholder="例如：妈妈 / 爸爸 / 我"
                className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">性别</label>
                <select
                  value={memberForm.sex}
                  onChange={(e) =>
                    setMemberForm((prev) => ({ ...prev, sex: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                >
                  <option value="">未设置</option>
                  <option value="m">男</option>
                  <option value="f">女</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">生日</label>
                <input
                  type="date"
                  value={memberForm.birthday}
                  onChange={(e) =>
                    setMemberForm((prev) => ({ ...prev, birthday: e.target.value }))
                  }
                  className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">身高（cm）</label>
                <input
                  type="number"
                  value={memberForm.heightCm}
                  onChange={(e) =>
                    setMemberForm((prev) => ({ ...prev, heightCm: e.target.value }))
                  }
                  placeholder="170"
                  className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">体重（kg）</label>
                <input
                  type="number"
                  value={memberForm.weightKg}
                  onChange={(e) =>
                    setMemberForm((prev) => ({ ...prev, weightKg: e.target.value }))
                  }
                  placeholder="60"
                  className="h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary/40"
                />
              </div>
            </div>

            {saveError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {saveError}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            {editingMember && !editingIsDefault ? (
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除成员
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorOpen(false)}
                className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                取消
              </button>
              <button
                onClick={handleSaveMember}
                disabled={!memberForm.nickname.trim() || savingMember}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  !memberForm.nickname.trim() || savingMember
                    ? "bg-muted text-muted-foreground"
                    : "btn-bubble"
                )}
              >
                {savingMember ? "保存中..." : "保存修改"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除成员？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后将无法恢复，相关健康问答记录不会再关联到该成员。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
              disabled={deletingMember}
            >
              {deletingMember ? "正在删除..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}




