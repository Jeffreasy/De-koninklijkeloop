/**
 * Blog HTML Sanitizer — Server-side XSS protection for TipTap content.
 * Strips script tags, event handlers, and dangerous attributes
 * while preserving all valid TipTap output elements.
 */
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
    "p", "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "img",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "em", "strong", "s", "u",
    "br", "hr",
    "div", "span",
];

const ALLOWED_ATTRS: Record<string, string[]> = {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    pre: ["class"],
    code: ["class"],
    div: ["class"],
    span: ["class"],
};

export function sanitizeBlogHtml(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRS,
        allowedSchemes: ["http", "https", "mailto"],
        // Force safe link behavior
        transformTags: {
            a: (tagName, attribs) => ({
                tagName,
                attribs: {
                    ...attribs,
                    rel: "noopener noreferrer",
                    target: attribs.target || "_blank",
                },
            }),
        },
    });
}
