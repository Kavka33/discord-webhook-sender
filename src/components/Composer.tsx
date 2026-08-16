import { useState } from "react";
import functions from "@/lib/shared/kliv-functions.js";
import type { FunctionError } from "@/lib/shared/kliv-functions.js";
import { isValidWebhookUrl, hexToInt, remainingChars, MAX_CONTENT } from "@/lib/discord";
import { MessagePreview } from "@/components/MessagePreview";
import type { WebhookRow } from "@/components/WebhookList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyEmbed = { title: "", description: "", color: "#5865F2", imageUrl: "", footer: "" };

interface Props {
  webhook: WebhookRow | null;
  onSent: () => void;
}

export function Composer({ webhook, onSent }: Props) {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [embed, setEmbed] = useState(emptyEmbed);
  const [sending, setSending] = useState(false);

  const hasEmbed = !!(embed.title.trim() || embed.description.trim() || embed.imageUrl.trim());
  const canSend = !!webhook && (content.trim().length > 0 || hasEmbed) && content.length <= MAX_CONTENT;

  async function send() {
    if (!webhook) {
      toast.error("Pick a webhook first.");
      return;
    }
    if (!isValidWebhookUrl(webhook.url)) {
      toast.error("That saved webhook URL is not valid.");
      return;
    }
    setSending(true);
    try {
      await functions.post("discord-send", {
        url: webhook.url,
        webhookRowId: webhook._row_id,
        webhookName: webhook.name,
        content,
        username: username.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        embed: hasEmbed
          ? {
              title: embed.title.trim() || undefined,
              description: embed.description.trim() || undefined,
              imageUrl: embed.imageUrl.trim() || undefined,
              footer: embed.footer.trim() || undefined,
              color: hexToInt(embed.color),
            }
          : null,
      });
      toast.success("Message sent to Discord");
      setContent("");
      setEmbed(emptyEmbed);
      onSent();
    } catch (err) {
      const fe = err as FunctionError;
      toast.error(
        fe.status === 429
          ? "Discord is rate limiting this webhook. Try again shortly."
          : fe.message || "Could not send the message",
      );
      onSent();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">
            {webhook ? `Sending to ${webhook.name}` : "Pick a webhook to start"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Say something to your server…"
            />
            <p className="text-right text-xs text-muted-foreground">
              {remainingChars(content)} characters left
            </p>
          </div>

          <Accordion type="single" collapsible>
            <AccordionItem value="identity">
              <AccordionTrigger>Sender name &amp; avatar</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Display name</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Announcer"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avatar">Avatar image URL</Label>
                  <Input
                    id="avatar"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://…/avatar.png"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="embed">
              <AccordionTrigger>Embed</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="embed-title">Title</Label>
                  <Input
                    id="embed-title"
                    value={embed.title}
                    onChange={(e) => setEmbed({ ...embed, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="embed-desc">Description</Label>
                  <Textarea
                    id="embed-desc"
                    rows={3}
                    value={embed.description}
                    onChange={(e) => setEmbed({ ...embed, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="embed-color">Colour</Label>
                    <Input
                      id="embed-color"
                      type="color"
                      className="h-10 w-20 p-1"
                      value={embed.color}
                      onChange={(e) => setEmbed({ ...embed, color: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="embed-image">Image URL</Label>
                    <Input
                      id="embed-image"
                      value={embed.imageUrl}
                      onChange={(e) => setEmbed({ ...embed, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="embed-footer">Footer</Label>
                  <Input
                    id="embed-footer"
                    value={embed.footer}
                    onChange={(e) => setEmbed({ ...embed, footer: e.target.value })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="w-full" disabled={!canSend || sending} onClick={send}>
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send message
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagePreview
            username={username}
            avatarUrl={avatarUrl}
            content={content}
            embed={embed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
