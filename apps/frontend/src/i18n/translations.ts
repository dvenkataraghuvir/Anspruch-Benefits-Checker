// UI copy for both languages. `en` defines the shape; `de` must match it
// key-for-key (enforced by the Messages type). No euro figures, thresholds or
// statutory rules appear here — only product copy. Rule data lives in the
// engine manifests, never in the UI.

export type Lang = 'de' | 'en';

const en = {
  meta: {
    home: 'Anspruch — Check your German benefit entitlements',
    check: 'Anspruch — Eligibility check',
    how: 'Anspruch — How it works',
    privacy: 'Anspruch — Privacy',
    notFound: 'Anspruch — Page not found',
    description:
      'Anspruch checks your eligibility for German government benefits like Wohngeld — every result computed deterministically and backed by the official source, or honestly marked as unknown.',
  },

  nav: {
    brandSub: 'Benefit finder',
    home: 'Home',
    how: 'How it works',
    privacy: 'Privacy',
    check: 'Start check',
  },

  footer: {
    tagline: 'Cite the source or refuse — never guess.',
    product: 'Product',
    disclaimer:
      'Anspruch provides informational guidance, not legal or tax advice. The binding decision always rests with the responsible authority.',
    copyright: '© 2026 Anspruch',
  },

  home: {
    eyebrow: 'German benefits, checked properly',
    heroTitle: 'Find out what you may be entitled to — backed by the official rule.',
    heroLead:
      'Anspruch checks your eligibility for German government benefits such as Wohngeld. Every result is computed by a deterministic rules engine and grounded in a dated official source. When something cannot be verified, Anspruch says so instead of guessing.',
    ctaPrimary: 'Start the free check',
    ctaSecondary: 'How it works',

    principlesTitle: 'Why you can trust the result',
    principles: [
      {
        title: 'Cite the source or refuse',
        body: 'Every statement is grounded in a dated official rule — for example the Wohngeldgesetz (WoGG). If a claim cannot be backed by a source, Anspruch refuses to make it.',
      },
      {
        title: 'No guessed numbers',
        body: 'Eligibility and amounts come only from a deterministic, tested rules engine. The AI never does arithmetic and can never invent a euro figure.',
      },
      {
        title: 'Privacy by design',
        body: 'Income, rent and assets are processed transiently for the check. Nothing is stored unless you opt in, sensitive figures are never logged, and your browser never talks to an AI provider.',
      },
    ],

    stepsTitle: 'How the check works',
    steps: [
      {
        title: 'Describe your situation',
        body: 'Household size, rent, income, postal code — only what the rules actually need, clearly marked when sensitive.',
      },
      {
        title: 'The rules do the math',
        body: 'A deterministic engine selects the rule version valid today and computes your eligibility. No estimates, no AI arithmetic.',
      },
      {
        title: 'See grounded results',
        body: 'Clear result cards with the legal basis cited on each one. If a detail is missing, the card names it instead of guessing.',
      },
    ],

    programsTitle: 'What Anspruch checks',
    programsLead:
      'Anspruch is built benefit by benefit, each as a versioned, dated rule module.',
    programWohngeldTitle: 'Wohngeld (housing allowance)',
    programWohngeldBody:
      'The first supported benefit. Eligibility screening is live; the official calculation figures are transcribed from the dated official sources before any amount is shown — until then, amounts are honestly marked as unavailable rather than estimated.',
    programWohngeldStatus: 'First module',
    programMoreTitle: 'More benefits to follow',
    programMoreBody:
      'Kindergeld, Kinderzuschlag, BAföG and others follow the same pattern: a new dated rule module — the engine, the checks and the guarantees stay the same.',
    programMoreStatus: 'In development',

    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is this legal advice?',
        a: 'No. Anspruch provides informational guidance. The binding decision always rests with the responsible authority, for example your local Wohngeldbehörde.',
      },
      {
        q: 'What happens to my data?',
        a: 'Your details are processed transiently to compute the result. They are not stored unless you explicitly opt in, sensitive figures are never written to logs, and your browser never sends data to an AI provider.',
      },
      {
        q: 'Why does it sometimes answer “cannot determine”?',
        a: 'Because an honest refusal is worth more than a wrong guess. The result card tells you exactly which detail is missing, so you can add it and get a real answer.',
      },
      {
        q: 'Does an AI calculate my benefit?',
        a: 'No. All eligibility decisions and amounts come from a deterministic, tested rules engine. Language models only help explain results — a guard blocks any explanation whose numbers differ from the engine output.',
      },
    ],

    ctaBoxTitle: 'Check your entitlement in a few minutes',
    ctaBoxBody: 'Free, no account needed, and your details are not stored.',
  },

  how: {
    title: 'How Anspruch works',
    lead:
      'A money domain does not forgive guesswork. Anspruch is built around one promise: cite the source or refuse.',

    pipelineTitle: 'The pipeline',
    pipeline: [
      {
        title: 'Your situation, typed and validated',
        body: 'The intake form builds a structured profile — household, rent, income, region. Sensitive fields are marked, minimized and processed transiently.',
      },
      {
        title: 'A deterministic rules engine decides',
        body: 'Each benefit is a versioned rule module transcribed from dated official sources. The engine selects the version valid on the day of your check and computes the result. No AI is involved in any calculation.',
      },
      {
        title: 'Grounded explanations, guarded output',
        body: 'AI is used only to explain the already-computed result in plain language, using the citations attached to it. A guard blocks any explanation containing a figure the engine did not produce.',
      },
      {
        title: 'You stay in control',
        body: 'Anspruch never submits anything to an authority on its own. Any future application assistance requires your explicit approval at a visible gate.',
      },
    ],

    statesTitle: 'The five honest result states',
    statesLead:
      'Every check ends in exactly one of five states — including the two most tools hide: “cannot determine” and “unavailable”.',
    states: [
      {
        name: 'Likely eligible',
        body: 'You appear to qualify, with an amount computed by the rules engine and the legal basis cited.',
      },
      {
        name: 'Likely eligible — no amount',
        body: 'You appear to qualify for a non-monetary benefit, such as a Wohnberechtigungsschein (certificate).',
      },
      {
        name: 'Likely not eligible',
        body: 'The rules indicate you do not qualify, with the reason stated. Shown neutrally — not as a failure.',
      },
      {
        name: 'Cannot determine',
        body: 'A required detail is missing. The card names it precisely instead of filling the gap with a guess.',
      },
      {
        name: 'Temporarily unavailable',
        body: 'A technical issue on our side — clearly marked as not your fault, with the option to retry.',
      },
    ],

    honestyTitle: 'Honest by construction',
    honestyBody:
      'These guarantees are not a style choice — they are enforced in code. A result claiming eligibility without an amount, or an amount without a source, cannot even be constructed. Rule data is only ever transcribed from dated official publications; where figures have not yet been verified, the product says “unavailable” instead of showing a plausible-looking number.',

    ctaTitle: 'See it in action',
  },

  privacy: {
    title: 'Privacy',
    lead:
      'Anspruch deals with income, rent and household data — exactly the kind of information that deserves restraint. This page explains, in plain language, how it is handled.',
    sections: [
      {
        title: 'What is processed',
        body: 'Only what the benefit rules actually need: household size, residence status, postal code, rent, incomes and, where relevant, assets. Fields that are sensitive are marked as such in the form.',
      },
      {
        title: 'How it is processed',
        body: 'Your details are used transiently to compute the result and are not stored unless you explicitly opt in. If data is ever persisted, it is encrypted at rest. Sensitive figures are never written to logs. Processing takes place in the EU.',
      },
      {
        title: 'What never happens',
        body: 'Your browser never communicates with an AI provider — all requests go exclusively to the Anspruch backend. This site sets no advertising or tracking cookies and loads no third-party fonts or scripts.',
      },
      {
        title: 'Your rights',
        body: 'Under the GDPR you have the right to access, correct and erase data concerning you. Since details are not stored by default, there is usually nothing to erase — if you do opt in to saving an assessment, you can request its deletion at any time.',
      },
    ],
    legalNote:
      'Before public launch, this summary will be complemented by a full legal Datenschutzerklärung and Impressum as required by German law.',
  },

  check: {
    title: 'Eligibility check',
    lead: 'A few details about your household — sensitive fields are processed transiently and not stored.',
    sampleNote: 'Showing sample results. Connect the backend to compute real ones.',
    backendDown: 'Backend not reachable yet — still showing sample results.',
  },

  intake: {
    title: 'Your details',
    residence: 'Residence status',
    residenceOptions: {
      german_or_eu: 'German or EU citizen',
      settled_permit: 'Settled permit (Niederlassungserlaubnis)',
      residence_permit: 'Residence permit (Aufenthaltserlaubnis)',
      other_unsure: 'Other / not sure',
    },
    postalCode: 'Postal code (PLZ)',
    bundesland: 'Federal state',
    municipality: 'Municipality',
    municipalityHint: '— only if the app asks for it',
    optional: 'optional',
    age: 'Age',
    householdSize: 'People in household',
    privacyPanel: 'These details are processed securely and not stored.',
    coldRent: 'Cold rent (Bruttokaltmiete) €/month',
    coldRentPlaceholder: 'e.g. 750',
    coldRentHint:
      'Enter cold rent only — do not include heating. The app adds the § 12 WoGG heating component automatically.',
    membersTitle: 'Monthly gross income per person',
    membersHint: 'Tick each box that applies (§ 16 WoGG deductions, 10% each).',
    person: 'Person',
    grossPlaceholder: 'Gross in €',
    werbungskosten: 'Work-related expenses (Werbungskosten) €/month',
    werbungskostenHint:
      'Employees: 102.50 € is the standard allowance — enter more only if your actual costs are higher. Pension or self-employed income: enter your actual costs or 0.',
    checkTax: 'Income tax (Einkommensteuer)',
    checkHealth: 'Statutory health & care insurance',
    checkPension: 'Statutory pension insurance',
    assets: 'Total household assets €',
    assetsPlaceholder: '0 or leave blank',
    assetsHint: 'Relevant for § 21 WoGG. Leave blank if no significant savings or property.',
    coveringBenefit: 'Do you receive a benefit that already covers housing costs?',
    coveringBenefitHint:
      'Examples: Bürgergeld (SGB II), Sozialhilfe / Grundsicherung (SGB XII), Asylbewerberleistungen',
    yes: 'Yes',
    no: 'No',
    submit: 'See results →',
    errors: {
      plzRequired: 'Postal code (PLZ) is required.',
      rentNumber: 'Cold rent must be a number.',
      householdMin: 'Household size must be at least 1.',
      assetsNumber: 'Assets must be a number or left blank.',
      werbungskostenNumber: 'Work-related expenses must be a number.',
    },
  },

  results: {
    title: 'What you may be entitled to',
    subtitle: 'Tap a benefit to see why — and how to apply.',
    states: {
      eligible: 'Likely eligible',
      eligible_no_amount: 'Likely eligible',
      not_eligible: 'Likely not eligible',
      cannot_determine: 'One detail missing',
      unavailable: 'Temporarily unavailable',
    },
    perMonth: '/ month',
    basedOn: 'Based on',
    certificate: 'A certificate, not a cash amount',
    stillNeeded: 'Still needed:',
    addDetail: '+ Add detail',
    plzNotCovered:
      'This postal code is not covered yet — we’re adding more regions as we verify them. Try your local Wohngeldbehörde in the meantime.',
    unavailableDefault: 'Temporarily unavailable — this is not something you did.',
    retry: 'Try again',
    officialSource: 'Official source →',
    cardDisclaimer:
      'This is an estimate, not legal advice — the binding decision rests with your local Wohngeldbehörde.',
    findOffice: 'Find your Wohngeldstelle →',
    pageDisclaimer: 'Informational guidance, not legal or tax advice.',
  },

  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved.',
    backHome: 'Back to the homepage',
  },
};

export type Messages = typeof en;

const de: Messages = {
  meta: {
    home: 'Anspruch — Staatliche Leistungen prüfen',
    check: 'Anspruch — Anspruchs-Check',
    how: 'Anspruch — So funktioniert es',
    privacy: 'Anspruch — Datenschutz',
    notFound: 'Anspruch — Seite nicht gefunden',
    description:
      'Anspruch prüft Ihren Anspruch auf staatliche Leistungen wie Wohngeld — jedes Ergebnis deterministisch berechnet und mit der amtlichen Quelle belegt, oder ehrlich als unbekannt gekennzeichnet.',
  },

  nav: {
    brandSub: 'Leistungs-Check',
    home: 'Start',
    how: 'So funktioniert es',
    privacy: 'Datenschutz',
    check: 'Check starten',
  },

  footer: {
    tagline: 'Quelle zitieren oder ablehnen — niemals raten.',
    product: 'Produkt',
    disclaimer:
      'Anspruch bietet informative Orientierung, keine Rechts- oder Steuerberatung. Die verbindliche Entscheidung trifft immer die zuständige Behörde.',
    copyright: '© 2026 Anspruch',
  },

  home: {
    eyebrow: 'Staatliche Leistungen, richtig geprüft',
    heroTitle: 'Finden Sie heraus, was Ihnen zustehen könnte — belegt mit der amtlichen Regel.',
    heroLead:
      'Anspruch prüft Ihren Anspruch auf staatliche Leistungen wie Wohngeld. Jedes Ergebnis wird von einem deterministischen Regelwerk berechnet und mit einer datierten amtlichen Quelle belegt. Was sich nicht belegen lässt, sagt Anspruch ehrlich — statt zu raten.',
    ctaPrimary: 'Kostenlosen Check starten',
    ctaSecondary: 'So funktioniert es',

    principlesTitle: 'Warum Sie dem Ergebnis vertrauen können',
    principles: [
      {
        title: 'Quelle zitieren oder ablehnen',
        body: 'Jede Aussage ist in einer datierten amtlichen Regel verankert — zum Beispiel im Wohngeldgesetz (WoGG). Lässt sich eine Aussage nicht belegen, macht Anspruch sie nicht.',
      },
      {
        title: 'Keine geratenen Zahlen',
        body: 'Anspruch und Beträge kommen ausschließlich aus einem deterministischen, getesteten Regelwerk. Die KI rechnet nie und kann keinen Eurobetrag erfinden.',
      },
      {
        title: 'Datenschutz von Anfang an',
        body: 'Einkommen, Miete und Vermögen werden nur flüchtig für die Prüfung verarbeitet. Ohne Ihre Zustimmung wird nichts gespeichert, sensible Zahlen werden nie protokolliert, und Ihr Browser kommuniziert nie mit einem KI-Anbieter.',
      },
    ],

    stepsTitle: 'So läuft die Prüfung ab',
    steps: [
      {
        title: 'Situation beschreiben',
        body: 'Haushaltsgröße, Miete, Einkommen, Postleitzahl — nur, was die Regeln wirklich brauchen, sensible Felder klar gekennzeichnet.',
      },
      {
        title: 'Die Regeln rechnen',
        body: 'Ein deterministisches Regelwerk wählt die heute gültige Regelversion und berechnet Ihren Anspruch. Keine Schätzungen, keine KI-Rechnung.',
      },
      {
        title: 'Belegte Ergebnisse sehen',
        body: 'Klare Ergebniskarten mit zitierter Rechtsgrundlage. Fehlt eine Angabe, benennt die Karte sie — statt zu raten.',
      },
    ],

    programsTitle: 'Was Anspruch prüft',
    programsLead:
      'Anspruch wird Leistung für Leistung aufgebaut — jede als versioniertes, datiertes Regelmodul.',
    programWohngeldTitle: 'Wohngeld',
    programWohngeldBody:
      'Die erste unterstützte Leistung. Die Anspruchsprüfung ist aktiv; die amtlichen Berechnungswerte werden aus den datierten amtlichen Quellen übernommen, bevor ein Betrag angezeigt wird — bis dahin werden Beträge ehrlich als nicht verfügbar gekennzeichnet statt geschätzt.',
    programWohngeldStatus: 'Erstes Modul',
    programMoreTitle: 'Weitere Leistungen folgen',
    programMoreBody:
      'Kindergeld, Kinderzuschlag, BAföG und weitere folgen demselben Muster: ein neues datiertes Regelmodul — Regelwerk, Prüfungen und Garantien bleiben gleich.',
    programMoreStatus: 'In Entwicklung',

    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Ist das Rechtsberatung?',
        a: 'Nein. Anspruch bietet informative Orientierung. Die verbindliche Entscheidung trifft immer die zuständige Behörde, zum Beispiel Ihre Wohngeldbehörde.',
      },
      {
        q: 'Was passiert mit meinen Daten?',
        a: 'Ihre Angaben werden flüchtig verarbeitet, um das Ergebnis zu berechnen. Sie werden nicht gespeichert, es sei denn, Sie stimmen ausdrücklich zu. Sensible Zahlen werden nie protokolliert, und Ihr Browser sendet keine Daten an einen KI-Anbieter.',
      },
      {
        q: 'Warum antwortet es manchmal „nicht feststellbar“?',
        a: 'Weil eine ehrliche Absage mehr wert ist als eine falsche Vermutung. Die Ergebniskarte benennt genau, welche Angabe fehlt — damit Sie sie ergänzen und eine echte Antwort bekommen.',
      },
      {
        q: 'Berechnet eine KI meine Leistung?',
        a: 'Nein. Alle Entscheidungen und Beträge kommen aus einem deterministischen, getesteten Regelwerk. Sprachmodelle helfen nur beim Erklären — eine Schutzfunktion blockiert jede Erklärung, deren Zahlen vom Ergebnis des Regelwerks abweichen.',
      },
    ],

    ctaBoxTitle: 'Prüfen Sie Ihren Anspruch in wenigen Minuten',
    ctaBoxBody: 'Kostenlos, ohne Konto — Ihre Angaben werden nicht gespeichert.',
  },

  how: {
    title: 'So funktioniert Anspruch',
    lead:
      'Bei Geld verzeiht nichts eine Vermutung. Anspruch ist um ein Versprechen herum gebaut: Quelle zitieren oder ablehnen.',

    pipelineTitle: 'Der Ablauf',
    pipeline: [
      {
        title: 'Ihre Situation, strukturiert und validiert',
        body: 'Das Formular erstellt ein strukturiertes Profil — Haushalt, Miete, Einkommen, Region. Sensible Felder sind gekennzeichnet, auf das Nötigste beschränkt und werden flüchtig verarbeitet.',
      },
      {
        title: 'Ein deterministisches Regelwerk entscheidet',
        body: 'Jede Leistung ist ein versioniertes Regelmodul, übertragen aus datierten amtlichen Quellen. Das Regelwerk wählt die am Prüftag gültige Version und berechnet das Ergebnis. An keiner Berechnung ist KI beteiligt.',
      },
      {
        title: 'Belegte Erklärungen, geprüfte Ausgabe',
        body: 'KI wird nur genutzt, um das bereits berechnete Ergebnis verständlich zu erklären — mit den beigefügten Quellen. Eine Schutzfunktion blockiert jede Erklärung mit einer Zahl, die das Regelwerk nicht erzeugt hat.',
      },
      {
        title: 'Sie behalten die Kontrolle',
        body: 'Anspruch reicht nie eigenständig etwas bei einer Behörde ein. Jede künftige Antragshilfe erfordert Ihre ausdrückliche Freigabe an einer sichtbaren Stelle.',
      },
    ],

    statesTitle: 'Die fünf ehrlichen Ergebniszustände',
    statesLead:
      'Jede Prüfung endet in genau einem von fünf Zuständen — einschließlich der beiden, die die meisten Tools verstecken: „nicht feststellbar“ und „nicht verfügbar“.',
    states: [
      {
        name: 'Wahrscheinlich berechtigt',
        body: 'Sie erfüllen die Voraussetzungen voraussichtlich — mit einem vom Regelwerk berechneten Betrag und zitierter Rechtsgrundlage.',
      },
      {
        name: 'Wahrscheinlich berechtigt — ohne Betrag',
        body: 'Sie erfüllen voraussichtlich die Voraussetzungen für eine nicht-monetäre Leistung, etwa einen Wohnberechtigungsschein.',
      },
      {
        name: 'Wahrscheinlich nicht berechtigt',
        body: 'Nach den Regeln besteht voraussichtlich kein Anspruch — mit Begründung. Neutral dargestellt, nicht als Misserfolg.',
      },
      {
        name: 'Nicht feststellbar',
        body: 'Eine erforderliche Angabe fehlt. Die Karte benennt sie präzise, statt die Lücke mit einer Vermutung zu füllen.',
      },
      {
        name: 'Vorübergehend nicht verfügbar',
        body: 'Ein technisches Problem auf unserer Seite — klar gekennzeichnet als nicht Ihr Fehler, mit der Möglichkeit, es erneut zu versuchen.',
      },
    ],

    honestyTitle: 'Ehrlich per Konstruktion',
    honestyBody:
      'Diese Garantien sind keine Stilfrage — sie sind im Code verankert. Ein Ergebnis, das Berechtigung ohne Betrag oder einen Betrag ohne Quelle behauptet, kann gar nicht erst entstehen. Regeldaten werden ausschließlich aus datierten amtlichen Veröffentlichungen übernommen; wo Werte noch nicht verifiziert sind, sagt das Produkt „nicht verfügbar“, statt eine plausibel wirkende Zahl zu zeigen.',

    ctaTitle: 'Sehen Sie es in Aktion',
  },

  privacy: {
    title: 'Datenschutz',
    lead:
      'Anspruch verarbeitet Einkommen, Miete und Haushaltsdaten — genau die Art von Informationen, die Zurückhaltung verdient. Diese Seite erklärt verständlich, wie damit umgegangen wird.',
    sections: [
      {
        title: 'Was verarbeitet wird',
        body: 'Nur, was die Leistungsregeln tatsächlich benötigen: Haushaltsgröße, Aufenthaltsstatus, Postleitzahl, Miete, Einkommen und gegebenenfalls Vermögen. Sensible Felder sind im Formular als solche gekennzeichnet.',
      },
      {
        title: 'Wie verarbeitet wird',
        body: 'Ihre Angaben werden flüchtig zur Berechnung des Ergebnisses genutzt und nicht gespeichert, es sei denn, Sie stimmen ausdrücklich zu. Sollte je etwas gespeichert werden, geschieht das verschlüsselt. Sensible Zahlen werden nie protokolliert. Die Verarbeitung findet in der EU statt.',
      },
      {
        title: 'Was nie passiert',
        body: 'Ihr Browser kommuniziert nie mit einem KI-Anbieter — alle Anfragen gehen ausschließlich an das Anspruch-Backend. Diese Seite setzt keine Werbe- oder Tracking-Cookies und lädt keine Schriften oder Skripte von Dritten.',
      },
      {
        title: 'Ihre Rechte',
        body: 'Nach der DSGVO haben Sie das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten. Da Angaben standardmäßig nicht gespeichert werden, gibt es meist nichts zu löschen — falls Sie eine Prüfung speichern, können Sie deren Löschung jederzeit verlangen.',
      },
    ],
    legalNote:
      'Vor einem öffentlichen Start wird diese Zusammenfassung um eine vollständige Datenschutzerklärung und ein Impressum ergänzt, wie es das deutsche Recht verlangt.',
  },

  check: {
    title: 'Anspruchs-Check',
    lead: 'Einige Angaben zu Ihrem Haushalt — sensible Felder werden flüchtig verarbeitet und nicht gespeichert.',
    sampleNote: 'Beispielergebnisse werden angezeigt. Backend verbinden, um echte zu berechnen.',
    backendDown: 'Backend noch nicht erreichbar — weiterhin Beispielergebnisse.',
  },

  intake: {
    title: 'Ihre Angaben',
    residence: 'Aufenthaltsstatus',
    residenceOptions: {
      german_or_eu: 'Deutsch oder EU-Bürger:in',
      settled_permit: 'Niederlassungserlaubnis',
      residence_permit: 'Aufenthaltserlaubnis',
      other_unsure: 'Anderes / unsicher',
    },
    postalCode: 'Postleitzahl (PLZ)',
    bundesland: 'Bundesland',
    municipality: 'Gemeinde',
    municipalityHint: '— nur, wenn die App danach fragt',
    optional: 'optional',
    age: 'Alter',
    householdSize: 'Personen im Haushalt',
    privacyPanel: 'Diese Angaben werden sicher verarbeitet und nicht gespeichert.',
    coldRent: 'Kaltmiete (Bruttokaltmiete) €/Monat',
    coldRentPlaceholder: 'z. B. 750',
    coldRentHint:
      'Nur Kaltmiete angeben — ohne Heizkosten. Die App ergänzt die Heizkomponente nach § 12 WoGG automatisch.',
    membersTitle: 'Monatliches Bruttoeinkommen je Person',
    membersHint: 'Zutreffendes ankreuzen (§ 16 WoGG-Abzüge, je 10 %).',
    person: 'Person',
    grossPlaceholder: 'Brutto in €',
    werbungskosten: 'Werbungskosten €/Monat',
    werbungskostenHint:
      'Arbeitnehmer:innen: 102,50 € ist der Arbeitnehmer-Pauschbetrag — nur mehr eintragen, wenn Ihre tatsächlichen Kosten höher sind. Rente oder selbstständige Einkünfte: tatsächliche Kosten oder 0 eintragen.',
    checkTax: 'Einkommensteuer',
    checkHealth: 'Gesetzliche Kranken- und Pflegeversicherung',
    checkPension: 'Gesetzliche Rentenversicherung',
    assets: 'Gesamtvermögen des Haushalts €',
    assetsPlaceholder: '0 oder freilassen',
    assetsHint: 'Relevant für § 21 WoGG. Freilassen, wenn kein nennenswertes Vermögen vorhanden.',
    coveringBenefit: 'Erhalten Sie eine Leistung, die die Wohnkosten bereits abdeckt?',
    coveringBenefitHint:
      'Beispiele: Bürgergeld (SGB II), Sozialhilfe / Grundsicherung (SGB XII), Asylbewerberleistungen',
    yes: 'Ja',
    no: 'Nein',
    submit: 'Ergebnisse anzeigen →',
    errors: {
      plzRequired: 'Postleitzahl (PLZ) ist erforderlich.',
      rentNumber: 'Kaltmiete muss eine Zahl sein.',
      householdMin: 'Haushaltsgröße muss mindestens 1 sein.',
      assetsNumber: 'Vermögen muss eine Zahl sein oder freigelassen werden.',
      werbungskostenNumber: 'Werbungskosten müssen eine Zahl sein.',
    },
  },

  results: {
    title: 'Was Ihnen zustehen könnte',
    subtitle: 'Tippen Sie auf eine Leistung, um Gründe und Antragsweg zu sehen.',
    states: {
      eligible: 'Wahrscheinlich berechtigt',
      eligible_no_amount: 'Wahrscheinlich berechtigt',
      not_eligible: 'Wahrscheinlich nicht berechtigt',
      cannot_determine: 'Eine Angabe fehlt',
      unavailable: 'Vorübergehend nicht verfügbar',
    },
    perMonth: '/ Monat',
    basedOn: 'Grundlage:',
    certificate: 'Ein Nachweis, kein Geldbetrag',
    stillNeeded: 'Noch benötigt:',
    addDetail: '+ Angabe ergänzen',
    plzNotCovered:
      'Diese Postleitzahl ist noch nicht abgedeckt — wir ergänzen weitere Regionen, sobald sie verifiziert sind. Wenden Sie sich in der Zwischenzeit an Ihre Wohngeldbehörde.',
    unavailableDefault: 'Vorübergehend nicht verfügbar — das liegt nicht an Ihnen.',
    retry: 'Erneut versuchen',
    officialSource: 'Amtliche Quelle →',
    cardDisclaimer:
      'Dies ist eine Einschätzung, keine Rechtsberatung — die verbindliche Entscheidung trifft Ihre Wohngeldbehörde.',
    findOffice: 'Wohngeldstelle finden →',
    pageDisclaimer: 'Informative Orientierung, keine Rechts- oder Steuerberatung.',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    body: 'Die gesuchte Seite existiert nicht oder wurde verschoben.',
    backHome: 'Zurück zur Startseite',
  },
};

export const messages: Record<Lang, Messages> = { de, en };
