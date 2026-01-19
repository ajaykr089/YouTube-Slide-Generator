import { exportList } from "@/app/constant";
import { test, expect, Page } from "@playwright/test";

test.describe("homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
  });

  const fillForm = async (
    page: Page,
    { topic, link }: { topic?: string; link?: string }
  ) => {
    if (topic) {
      await page.getByLabel("Video Topic").fill(topic);
    }
    if (link) {
      await page.getByLabel("Youtube Link").fill(link);
    }
  };

  const clickSubmit = async (page: Page) => {
    await page.getByRole("button", { name: "Generate Slides" }).click();
  };

  test("homepage loads with title and heading", async ({ page }) => {
    await expect(page).toHaveTitle("YouTube Slide Generator");

    await expect(
      page.getByRole("heading", { name: "🎬 YouTube Slide Generator" })
    ).toBeVisible();
  });

  test("shows validation errors when form is submitted empty", async ({
    page,
  }) => {
    await clickSubmit(page);

    await expect(page.getByText("Video topic is required")).toBeVisible();
    await expect(page.getByText("Youtube link is required")).toBeVisible();
  });

  test("shows error for invalid youtube link", async ({ page }) => {
    await fillForm(page, {
      topic: "React Tutorial",
      link: "https://www.google.com",
    });
    await clickSubmit(page);
    await expect(
      page.getByText("Please enter a valid YouTube URL")
    ).toBeVisible();
  });

  test("Button text is changing", async ({ page }) => {
    await page.getByLabel("Video Topic").fill("React Hooks");
    await page
      .getByLabel("YouTube Link")
      .fill("https://www.youtube.com/watch?v=hLpGO6uZCX8");

    await clickSubmit(page);
    await expect(
      page.getByRole("button", { name: "Generating Slides…" })
    ).toBeVisible();
  });

  test("user generated slides successfully", async ({ page }) => {
    const slides = page.getByTestId("slide");
    await fillForm(page, {
      topic: "React Tutorial",
      link: "https://www.youtube.com/watch?v=hLpGO6uZCX8",
    });
    await clickSubmit(page);
    await expect(page.getByText("Generated Slides")).toBeVisible();
    await expect(page.getByRole("button", { name: "Markdown" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Google Slides" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "JSON" })).toBeVisible();
    await expect(page.getByRole("button", { name: "PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Keynote" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "PowerPoint" })
    ).toBeVisible();
    await expect(slides.first()).toBeVisible();
  });

  test("all exports are downloading properly", async ({ page }) => {
    await fillForm(page, {
      topic: "React Tutorial",
      link: "https://www.youtube.com/watch?v=hLpGO6uZCX8",
    });

    await clickSubmit(page);

    await expect(
      page.getByRole("heading", { name: "Generated Slides" })
    ).toBeVisible();

    for (const option of exportList) {
      const btn = page.getByRole("button", { name: option.label });

      await expect(btn).toBeVisible();
      await expect(btn).toBeEnabled();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        btn.click(),
      ]);

      const fileName = download.suggestedFilename();
      expect(fileName).toBeTruthy();

      await download.path();

      if (option.format) {
        expect(fileName.toLowerCase()).toContain(option.format);
      }
    }
  });
});
