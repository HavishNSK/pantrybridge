import { Link } from 'react-router-dom'
import { ModuleTitle, PageHeader } from '../components/ui/Section'

export default function Privacy() {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Privacy & storage" lede="What this local demo keeps, what happens to photos, and how to clear your information." />
      <p className="mb-5 text-sm leading-relaxed text-ink-2">Updated October 25, 2026. This describes the current prototype. It is factual product information, not a completed legal review.</p>
      <div className="modules grid-cols-1">
        <section className="module" aria-labelledby="privacy-data">
          <ModuleTitle id="privacy-data">The information you enter</ModuleTitle>
          <p className="text-[15px] leading-relaxed">Your pantry ingredients and quantities, meal plan, household size, cooking preferences, budget, and shopping lists are used in this browser to suggest meals and plan groceries. The county you choose helps display food-support resources. There is no account or cloud sync.</p>
          <p className="mt-3 text-[15px] leading-relaxed">FullPlate never asks for an EBT card number, PIN, account login, or proof of hardship. You can use synthetic food-box and receipt samples without choosing a personal photo.</p>
        </section>
        <section className="module" aria-labelledby="privacy-photos">
          <ModuleTitle id="privacy-photos">Temporary photos and sample results</ModuleTitle>
          <p className="text-[15px] leading-relaxed">Selected photos stay in temporary browser memory for preview. The demo does not upload or analyze them, and sample results are independent of your image. Photos are not saved in browser storage. Preview URLs are released when you replace or remove the photo or leave the scan screen.</p>
          <p className="mt-3 text-[15px] leading-relaxed">Review and correct sample ingredients before saving. Saved ingredient rows remain part of your pantry until you edit or remove them; they do not include the original photo.</p>
        </section>
        <section className="module" aria-labelledby="privacy-storage">
          <ModuleTitle id="privacy-storage">Browser storage and retention</ModuleTitle>
          <p className="text-[15px] leading-relaxed">App data is saved using localStorage under <code className="break-all">pantrybridge:v1</code>. If access to localStorage throws, the store attempts sessionStorage instead. The last support county is stored separately in localStorage under <code className="break-all">pantrybridge:support-county</code>.</p>
          <p className="mt-3 text-[15px] leading-relaxed">Local storage can remain after you close the browser, until you clear it or your browser removes it. Session storage normally ends with the tab session. Storage can be unavailable or cleared by browser settings. There is no server backup or automatic expiration.</p>
          <p className="mt-3 text-[15px] leading-relaxed">Anyone with access to this browser profile may be able to see your saved information. Browser storage does not provide private accounts or secure separation on shared devices.</p>
        </section>
        <section className="module" aria-labelledby="privacy-delete">
          <ModuleTitle id="privacy-delete">Your choices and deletion</ModuleTitle>
          <p className="text-[15px] leading-relaxed">Edit or remove individual pantry entries at any time. In Settings, “Clear all my data” empties saved pantry, plans, budget, and lists, resets household and cooking preferences, and removes the saved county. The app may retain an empty/default state record so you can start fresh. “Reset demo data” replaces your app data with samples; it is not the clearing action and keeps your county choice.</p>
          <p className="mt-3 text-[15px] leading-relaxed">You can also remove this site's storage through your browser settings. Clearing FullPlate does not delete the original photo or receipt file from your device.</p>
          <Link to="/settings" className="mt-3 inline-flex min-h-11 items-center font-semibold text-forest underline">Open Settings to manage your data</Link>
        </section>
        <section className="module" aria-labelledby="privacy-third-party">
          <ModuleTitle id="privacy-third-party">Cookies, external links, and hosting</ModuleTitle>
          <p className="text-[15px] leading-relaxed">The application currently adds no analytics, advertising trackers, or tracking cookies. Its browser storage supports the features described above. Your pantry entries and selected photos are not sent to a server by this demo.</p>
          <p className="mt-3 text-[15px] leading-relaxed">Links to food-support organizations and other sites take you to services with their own privacy practices. Serving the app also involves requests to the server hosting its files; this page makes no claim about that server's access logs or retention. Hosting practices must be reviewed before public deployment.</p>
        </section>
        <section className="module" aria-labelledby="privacy-limits">
          <ModuleTitle id="privacy-limits">Prototype limits and source credit</ModuleTitle>
          <p className="text-[15px] leading-relaxed">Recipes come from a small local collection. Costs and nutrition are estimates, and the app does not determine assistance eligibility or assess food safety from photos. Any future accounts, analytics, or remote recognition will need an updated disclosure before use.</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">The structure of this page draws on the privacy policy and cookie notice templates prepared by <a href="https://github.com/General-Legal/legal-templates" className="font-semibold text-forest underline">General Legal</a>, released under <a href="https://github.com/General-Legal/legal-templates/blob/main/LICENSE" className="font-semibold text-forest underline">CC0 1.0</a>. General Legal has not reviewed this adaptation; using its templates does not create an attorney-client relationship or imply endorsement.</p>
        </section>
      </div>
    </div>
  )
}
