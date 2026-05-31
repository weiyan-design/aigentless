"use client";

import { useState } from "react";
import { BottomSheet } from "./bottom-sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onClose: () => void;
  unitName: string;
  unitAddress: string;
  attribute: string;
  onSend: () => void;
};

export function EmailSheet({
  open,
  onClose,
  unitName,
  unitAddress,
  attribute,
  onSend,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(
    `Hi,\n\nI'm interested in touring ${unitName} at ${unitAddress}. Could you confirm the unit has a ${attribute.toLowerCase()}?\n\nThanks,\nWei`
  );
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSend();
    }, 700);
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 className="font-serif text-[28px] leading-tight">
        Ask {unitName}
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We&rsquo;ll send this on your behalf.
      </p>

      <div className="mt-5 bg-card border border-border rounded-2xl overflow-hidden">
        <Field label="From" value="wei@aigentless.com" />
        <Field
          label="To"
          value={`leasing@${unitName.toLowerCase().replace(/\s/g, "")}.com`}
        />
        <Field label="Subject" value={`Quick question before touring`} />
        <div className="px-4 py-3.5">
          {editing ? (
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="bg-background text-[14px] leading-relaxed"
            />
          ) : (
            <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
              {body}
            </div>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className="mt-2 text-xs text-foreground/70 underline underline-offset-2"
          >
            {editing ? "Done editing" : "Edit message"}
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Replies come to your Aigentless inbox.
      </p>

      <div className="mt-6 space-y-2">
        <Button
          onClick={handleSend}
          disabled={sending}
          className="w-full h-12 text-base rounded-full"
        >
          {sending ? "Sending…" : "Send"}
        </Button>
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={sending}
          className="w-full h-12 text-base rounded-full"
        >
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex border-b border-border last:border-b-0 px-4 py-3 text-sm">
      <span className="text-muted-foreground w-16 shrink-0">{label}</span>
      <span className="flex-1 truncate text-foreground">{value}</span>
    </div>
  );
}
