interface Props {
  username: string;
  avatarUrl: string;
  content: string;
  embed: {
    title: string;
    description: string;
    color: string;
    imageUrl: string;
    footer: string;
  };
}

export function MessagePreview({ username, avatarUrl, content, embed }: Props) {
  const name = username.trim() || "Webhook";
  const hasEmbed = !!(embed.title.trim() || embed.description.trim() || embed.imageUrl.trim());

  return (
    <div className="rounded-xl bg-[hsl(220_8%_19%)] p-4">
      <div className="flex gap-3">
        {avatarUrl.trim() ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{name}</span>
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
              Bot
            </span>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>

          {content.trim() && (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">
              {content}
            </p>
          )}

          {hasEmbed && (
            <div
              className="mt-2 max-w-md rounded border-l-4 bg-[hsl(220_7%_16%)] p-3"
              style={{ borderLeftColor: embed.color || "#5865F2" }}
            >
              {embed.title.trim() && (
                <p className="font-semibold text-foreground">{embed.title}</p>
              )}
              {embed.description.trim() && (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/80">
                  {embed.description}
                </p>
              )}
              {embed.imageUrl.trim() && (
                <img src={embed.imageUrl} alt="" className="mt-2 rounded max-h-52 object-cover" />
              )}
              {embed.footer.trim() && (
                <p className="mt-2 text-xs text-muted-foreground">{embed.footer}</p>
              )}
            </div>
          )}

          {!content.trim() && !hasEmbed && (
            <p className="mt-1 text-sm italic text-muted-foreground">
              Your message will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
