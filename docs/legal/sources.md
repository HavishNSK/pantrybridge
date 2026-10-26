# Legal-template sources and adaptation notes

Reviewed October 25, 2026 against General-Legal/legal-templates revision [`6d6805425eabd41bed86fc1e2ec51612760f716c`](https://github.com/General-Legal/legal-templates/commit/6d6805425eabd41bed86fc1e2ec51612760f716c).

| Source | Use in FullPlate |
| --- | --- |
| [Repository README](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/README.md) | Verified source identity, template scope, and request to preserve credit |
| [CC0 1.0 license](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/LICENSE) | Verified permission to adapt template material; does not license the rest of FullPlate |
| [U.S. privacy-policy template](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/templates/privacy-policy-us/template.md) | Organizational prompts for information entered, purpose, retention, choices, and third-party links on `/privacy` |
| [Cookie-notice template](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/templates/cookie-notice/template.md) | Storage-technology and user-choice structure, adapted to actual localStorage/sessionStorage behavior |
| [Terms-of-use template](https://github.com/General-Legal/legal-templates/blob/6d6805425eabd41bed86fc1e2ec51612760f716c/templates/terms-of-use/template.md) | Structure for the unpublished [owner-review draft](terms-of-use-draft.md); owner-specific clauses remain unresolved |

The in-app page is a factual explanation of the current local demo, not a wholesale template policy or a completed legal review. Verified implementation references: `src/store/useStore.ts`, `src/components/support/countyStorage.ts`, `src/pages/Scan.tsx`, and `src/pages/Settings.tsx`. FullPlate uses `pantrybridge:v1` for persisted app state and `pantrybridge:support-county` for the county. Clearing resets the state and removes the county; it does not promise deletion of original device files. Resetting demo data replaces app state while retaining the county choice.

Inapplicable template provisions about accounts, payments, marketing, advertising, analytics, data sales, AI providers, cookies dashboards, cross-border transfers, and asserted statutory rights/compliance were not imported. No operator identity/contact, governing state, age threshold, arbitration agreement, or other binding legal term was invented. Hosting logs must be assessed for the actual deployment rather than assumed absent. No cookie banner was added because the current application does not implement tracking cookies or an analytics consent system.

Credit retained: the source templates were prepared and made publicly available by General Legal, PC. General Legal has not reviewed this adaptation. Template use is for reference and does not constitute legal advice, endorsement, or an attorney-client relationship. The source release is CC0 1.0; attribution is retained as requested by its authors.
