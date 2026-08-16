import { scenario, step, expect } from "kliv-scenario";

scenario("user saves a webhook and sends a message", async ({ kliv }) => {
  const actor = await kliv.actor({ name: "Webhook user" });
  const page = actor.page;

  await step("app loads signed in", async () => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Webhook Sender" })).toBeVisible();
  });

  const label = kliv.unique("Announcements");

  await step("save a webhook", async () => {
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByLabel("Label").fill(label);
    await page
      .getByLabel("Webhook URL")
      .fill("https://discord.com/api/webhooks/123456789012345678/scenario-token");
    await page.getByRole("button", { name: "Save webhook" }).click();
    await expect(page.getByText(label)).toBeVisible();
  });

  await step("compose a message and see it previewed", async () => {
    const body = kliv.unique("Hello from the scenario");
    await page.getByLabel("Message").fill(body);
    await expect(page.getByText(body)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeEnabled();
  });
});
