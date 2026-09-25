/**
 * Security contract for RichTextContent — the ONLY sanitization layer for plan
 * descriptions.
 *
 * Plan descriptions are stored raw. Nothing sanitizes the value between the
 * textarea and this component, and public plans render through here for
 * anonymous visitors, so this is where a stored-XSS would land.
 *
 * These tests pin that contract: react-markdown must keep rendering WITHOUT
 * `rehype-raw`. If someone adds it — or swaps in a renderer that emits raw HTML —
 * these go red instead of shipping the hole.
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RichTextContent } from "../RichTextContent";

afterEach(cleanup);

describe("RichTextContent — untrusted input must never become live DOM", () => {
  it("does not create a <script> element from embedded HTML", () => {
    const { container } = render(
      <RichTextContent content={"# Hola\n\n<script>alert(1)</script>"} />,
    );

    expect(container.querySelector("script")).toBeNull();
  });

  it("does not create an <img> with an inline event handler", () => {
    const { container } = render(
      <RichTextContent content={'<img src=x onerror="alert(1)">'} />,
    );

    // The markup survives as escaped *text* (`&lt;img …&gt;`), so asserting on
    // the raw innerHTML string would match that harmless text. What matters is
    // that no element — and no event handler attribute — was created.
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[onerror]")).toBeNull();
    expect(container.querySelectorAll("*")).toHaveLength(1); // just the wrapper div
  });

  it("does not create an <iframe> from embedded HTML", () => {
    const { container } = render(
      <RichTextContent
        content={'<iframe src="https://evil.example"></iframe>'}
      />,
    );

    expect(container.querySelector("iframe")).toBeNull();
  });

  it("strips javascript: URLs from markdown links", () => {
    const { container } = render(
      <RichTextContent content={"[click me](javascript:alert(1))"} />,
    );

    const link = container.querySelector("a");
    expect(link?.getAttribute("href") ?? "").not.toContain("javascript:");
  });

  it("strips data: URLs from markdown links", () => {
    const { container } = render(
      <RichTextContent
        content={
          "[click me](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)"
        }
      />,
    );

    const link = container.querySelector("a");
    expect(link?.getAttribute("href") ?? "").not.toContain("data:");
  });
});

describe("RichTextContent — legitimate markdown must survive", () => {
  it('renders blockquotes (nh3 escaped the leading ">" and broke these)', () => {
    const { container } = render(<RichTextContent content={"> una cita"} />);

    expect(container.querySelector("blockquote")).not.toBeNull();
    expect(container.textContent).toContain("una cita");
  });

  it("renders autolinks (nh3 dropped these entirely)", () => {
    const { container } = render(
      <RichTextContent content={"<https://hotosm.org>"} />,
    );

    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://hotosm.org");
  });

  it("renders ampersands and angle brackets as typed (nh3 stored them escaped)", () => {
    const { container } = render(
      <RichTextContent content={"Agua & fuego, 5 < 10"} />,
    );

    expect(container.textContent).toContain("Agua & fuego");
    expect(container.textContent).not.toContain("&amp;");
  });

  it("renders headings, emphasis, lists and safe links", () => {
    const { container } = render(
      <RichTextContent
        content={
          "# Titulo\n\n**negrita**\n\n- uno\n- dos\n\n[HOT](https://hotosm.org)"
        }
      />,
    );

    expect(container.querySelector("h1")?.textContent).toBe("Titulo");
    expect(container.querySelector("strong")?.textContent).toBe("negrita");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://hotosm.org",
    );
  });
});
