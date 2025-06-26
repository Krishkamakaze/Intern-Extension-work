if (!window.__playwright_inspector_active__) {
    window.__playwright_inspector_active__ = true;
  
    // Create overlay for highlighting elements
    let overlay = document.getElementById("__playwright_inspector_overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "__playwright_inspector_overlay";
      overlay.style.position = "absolute";
      overlay.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "10000";
      document.body.appendChild(overlay);
    }
  
    // Utility functions
    const quote = (value) => `'${value.replace(/'/g, "\\'")}'`;
  
    const toSnakeCase = (str) =>
      str.replace(/([A-Z])/g, "_$1").toLowerCase();
  
    // Get accessibility information
    const getAccessibilityInfo = (element) => {
      const tag = element.tagName.toUpperCase();
      let role = element.getAttribute("role");
  
      if (!role) {
        role = {
          A: "link",
          BUTTON: "button",
          INPUT: {
            checkbox: "checkbox",
            radio: "radio",
            text: "textbox",
            email: "textbox",
            password: "textbox",
            search: "searchbox",
            file: "file upload",
            range: "slider",
            number: "spinbutton",
          }[element.type] || "input",
          SELECT: "combobox",
          TEXTAREA: "textbox",
          IMG: "img",
          FORM: "form",
          TABLE: "table",
          UL: "list",
          OL: "list",
          LI: "listitem",
          HEADER: "banner",
          FOOTER: "contentinfo",
          NAV: "navigation",
          MAIN: "main",
          SECTION: "region",
          ARTICLE: "article",
          ASIDE: "complementary",
          H1: "heading",
          H2: "heading",
          H3: "heading",
          H4: "heading",
          H5: "heading",
          H6: "heading",
          LABEL: "label",
          PROGRESS: "progressbar",
          SUMMARY: "summary",
          DETAILS: "group",
        }[tag];
      }
  
      const accessibleName =
        element.getAttribute("aria-label") ||
        element.getAttribute("alt") ||
        element.getAttribute("title") ||
        element.textContent.trim();
  
      const keyboardFocusable =
        element.hasAttribute("tabindex") ||
        ["BUTTON", "A", "INPUT", "TEXTAREA", "SELECT", "SUMMARY"].includes(tag);
  
      return { role, accessibleName, keyboardFocusable };
    };
  
    // Generate Playwright selectors
    const generatePlaywrightSelectors = (element) => {
      const selectors = [];
      const { role, accessibleName } = getAccessibilityInfo(element);
  
      selectors.push(`locator(${quote(element.tagName.toLowerCase())})`);
  
      if (role) {
        const attrs = accessibleName
          ? `, { name: ${quote(accessibleName)} }`
          : "";
        selectors.push(`getByRole(${quote(role)}${attrs})`);
      }
  
      const textContent = element.textContent.trim();
      if (textContent) {
        selectors.push(`getByText(${quote(textContent)})`);
      }
  
      if (element.hasAttribute("aria-label")) {
        selectors.push(
          `getByLabel(${quote(element.getAttribute("aria-label"))})`
        );
      }
  
      if (element.hasAttribute("placeholder")) {
        selectors.push(
          `getByPlaceholder(${quote(element.getAttribute("placeholder"))})`
        );
      }
  
      if (element.tagName === "IMG" && element.hasAttribute("alt")) {
        selectors.push(
          `getByAltText(${quote(element.getAttribute("alt"))})`
        );
      }
  
      if (element.hasAttribute("title")) {
        selectors.push(
          `getByTitle(${quote(element.getAttribute("title"))})`
        );
      }
  
      if (element.hasAttribute("data-testid")) {
        selectors.push(
          `getByTestId(${quote(element.getAttribute("data-testid"))})`
        );
      }
  
      return selectors;
    };
  
    // Check if selector is unique
    async function isUniqueElement(page, selector) {
      const elements = await page.$$(selector);
      return elements.length === 1;
    }
  
    // Highlight selected element
    const highlightElement = (e) => {
      const rect = e.target.getBoundingClientRect();
      overlay.style.top = `${rect.top + window.scrollY}px`;
      overlay.style.left = `${rect.left + window.scrollX}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };
  
    // Handle element click
    const handleElementClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
  
      const selectors = generatePlaywrightSelectors(e.target);
      const { role, accessibleName, keyboardFocusable } =
        getAccessibilityInfo(e.target);
  
      alert(`
  Playwright Selectors:
  ${selectors.join("\n")}
  
  Accessibility Details:
  - Role: ${role || "N/A"}
  - Name: ${accessibleName || "N/A"}
  - Keyboard-Focusable: ${keyboardFocusable ? "Yes" : "No"}
      `);
  
      cleanup();
    };
  
    // Cleanup overlay and listeners
    const cleanup = () => {
      document.removeEventListener("mousemove", highlightElement);
      document.removeEventListener("click", handleElementClick);
      document.body.style.cursor = "default";
      overlay.remove();
      window.__playwright_inspector_active__ = false;
    };
  
    // Initialize inspector
    document.body.style.cursor = "crosshair";
    document.addEventListener("mousemove", highlightElement);
    document.addEventListener("click", handleElementClick);
  }
  