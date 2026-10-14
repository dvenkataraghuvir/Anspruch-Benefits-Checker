// UI copy for both languages. `en` defines the shape; `de` must match it
// key-for-key (enforced by the Messages type). No euro figures, thresholds or
// statutory rules appear here, only product copy. Rule data lives in the
// engine manifests, never in the UI.

export type Lang = 'de' | 'en';

const en = {
  meta: {
    home: 'Check your German benefit entitlements | Anspruch',
    check: 'Eligibility check | Anspruch',
    how: 'How it works | Anspruch',
    privacy: 'Privacy | Anspruch',
    notFound: 'Page not found | Anspruch',
    description:
      'Anspruch checks whether you qualify for German government benefits such as Wohngeld. Every result is calculated by fixed rules and linked to the official source. If something can\'t be checked, Anspruch says so.',
  },

  beta: {
    text: 'Wohngeld amounts are currently calculated for Würzburg only. Other regions follow soon.',
  },

  nav: {
    brandSub: 'Benefit finder',
    home: 'Home',
    how: 'How it works',
    privacy: 'Privacy',
    check: 'Start check',
  },

  footer: {
    tagline: 'Every answer comes with its source.',
    product: 'Product',
    disclaimer:
      'Anspruch gives general information, not legal or tax advice. The responsible authority makes the binding decision.',
    copyright: '© 2026 Anspruch',
  },

  home: {
    eyebrow: 'German benefits, checked properly',
    heroTitle: 'Find out what you may be entitled to, backed by the official rule.',
    heroLead:
      'Anspruch checks whether you qualify for German government benefits such as Wohngeld. A rules engine calculates every result and links it to a dated official source. When something can\'t be verified, Anspruch tells you instead of guessing.',
    ctaPrimary: 'Start the free check',
    ctaSecondary: 'How it works',

    principlesTitle: 'Why you can trust the result',
    principles: [
      {
        title: 'Cite the source or refuse',
        body: 'Each statement points to a dated official rule, for example the Wohngeldgesetz (WoGG). If no source backs a claim, Anspruch doesn\'t make it.',
      },
      {
        title: 'No guessed numbers',
        body: 'Eligibility and amounts come only from a tested rules engine. The AI never does the math, so it can\'t make up a euro amount.',
      },
      {
        title: 'Privacy by design',
        body: 'Your income, rent and assets are used for the check and nothing else. Nothing is stored unless you opt in, sensitive figures never end up in logs, and your browser never talks to an AI provider.',
      },
    ],

    stepsTitle: 'How the check works',
    steps: [
      {
        title: 'Describe your situation',
        body: 'Household size, rent, income and postal code. We only ask for what the rules need, and sensitive fields are marked.',
      },
      {
        title: 'The rules do the math',
        body: 'The engine picks the version of the rules that applies today and works out your eligibility. Nothing is estimated, and no AI is involved in the calculation.',
      },
      {
        title: 'See your results',
        body: 'Each result card cites its legal basis. If a detail is missing, the card tells you which one.',
      },
    ],

    programsTitle: 'What Anspruch checks',
    programsLead:
      'Anspruch adds one benefit at a time. Each one is a separate rule module with its own version and date.',
    programWohngeldTitle: 'Wohngeld (housing allowance)',
    programWohngeldBody:
      'The first benefit Anspruch supports. Every figure in the calculation is copied from the official legal text and checked against the government\'s Wohngeld calculator. Cases that haven\'t been checked yet show "unavailable" instead of an estimate.',
    programWohngeldStatus: 'First module',
    programMoreTitle: 'More benefits to follow',
    programMoreBody:
      'Kindergeld, Kinderzuschlag, BAföG and others will work the same way. Each gets its own dated rule module, while the engine and its checks stay unchanged.',
    programMoreStatus: 'In development',

    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'Is this legal advice?',
        a: 'No. Anspruch gives general information. The binding decision is made by the responsible authority, for example your local Wohngeldbehörde.',
      },
      {
        q: 'What happens to my data?',
        a: 'Your details are used to calculate the result and are not stored unless you opt in. Sensitive figures are never written to logs, and your browser never sends anything to an AI provider.',
      },
      {
        q: 'Why does it sometimes say "cannot determine"?',
        a: 'Because we would rather admit we don\'t know than guess wrong about your money. The result card names the missing detail, so you can add it and get a real answer.',
      },
      {
        q: 'Does an AI calculate my benefit?',
        a: 'No. A tested rules engine makes every eligibility decision and calculates every amount. We plan to add AI that explains results in plain language. It will never calculate anything, and a check will block any explanation whose numbers differ from the engine\'s.',
      },
    ],

    ctaBoxTitle: 'Check your entitlement in a few minutes',
    ctaBoxBody: 'It\'s free, you don\'t need an account, and nothing you enter is stored.',
  },

  how: {
    title: 'How Anspruch works',
    lead:
      'When money is involved, a wrong guess can cost you. Anspruch is built around one rule: cite the source or don\'t answer.',

    pipelineTitle: 'Step by step',
    pipeline: [
      {
        title: 'Your situation as structured data',
        body: 'The form turns your answers into a structured profile of your household, rent, income and region. Sensitive fields are marked, kept to a minimum and not stored.',
      },
      {
        title: 'A rules engine decides',
        body: 'Each benefit is a versioned rule module copied from dated official sources. The engine uses the version that applies on the day of your check. No AI touches the calculation.',
      },
      {
        title: 'Explanations with sources (planned)',
        body: 'Next, AI will explain results that have already been calculated, in plain language and using the sources attached to them. If an explanation contains a figure the engine didn\'t produce, it will be blocked.',
      },
      {
        title: 'You stay in control',
        body: 'Anspruch never submits anything to an authority by itself. Any future help with applications will need your explicit approval first.',
      },
    ],

    statesTitle: 'Five possible results',
    statesLead:
      'Every check ends with one of five results. Two of them, "cannot determine" and "unavailable", are ones most tools leave out.',
    states: [
      {
        name: 'Likely eligible',
        body: 'You probably qualify. The card shows the amount the rules engine calculated and the legal basis.',
      },
      {
        name: 'Likely eligible, no amount',
        body: 'You probably qualify for a benefit that isn\'t paid as money, such as a Wohnberechtigungsschein (housing certificate).',
      },
      {
        name: 'Likely not eligible',
        body: 'By the rules, you probably don\'t qualify. The card gives the reason and shows it neutrally, not as a failure.',
      },
      {
        name: 'Cannot determine',
        body: 'Something we need is missing. The card names it instead of filling the gap with a guess.',
      },
      {
        name: 'Temporarily unavailable',
        body: 'Something went wrong on our side. The card says so clearly and lets you try again.',
      },
    ],

    honestyTitle: 'Enforced in code',
    honestyBody:
      'The system can\'t even create a result that claims eligibility without an amount, or an amount without a source. Rule data comes only from dated official publications. Where a figure hasn\'t been verified yet, the app shows "unavailable" rather than a number that merely looks plausible.',

    ctaTitle: 'Try it yourself',
  },

  privacy: {
    title: 'Privacy',
    lead:
      'Anspruch handles income, rent and household data, so it collects as little as it can. This page explains in plain language what happens to that data.',
    sections: [
      {
        title: 'What we process',
        body: 'Only what the benefit rules need: household size, residence status, postal code, rent, income and, where relevant, assets. Sensitive fields are marked in the form.',
      },
      {
        title: 'How we process it',
        body: 'Your details are used to calculate the result and are not stored unless you opt in. If anything is stored, it is encrypted. Sensitive figures are never written to logs, and processing happens in the EU.',
      },
      {
        title: 'What never happens',
        body: 'Your browser never contacts an AI provider. Every request goes to the Anspruch backend and nowhere else. The site sets no advertising or tracking cookies and loads no fonts or scripts from other companies.',
      },
      {
        title: 'Your rights',
        body: 'Under the GDPR you can ask to see, correct or delete data about you. Because nothing is stored by default, there is usually nothing to delete. If you choose to save an assessment, you can have it deleted at any time.',
      },
    ],
    legalNote:
      'Before the public launch, a full Datenschutzerklärung and Impressum will be added, as German law requires.',
  },

  check: {
    title: 'Eligibility check',
    lead: 'A few questions about your household. Sensitive answers are not stored.',
    sampleNote: 'These are sample results. Connect the backend to see real ones.',
    backendDown: 'The backend isn\'t reachable yet, so you\'re still seeing sample results.',
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
    municipalityHint: '(only if the app asks for it)',
    optional: 'optional',
    age: 'Age',
    householdSize: 'People in household',
    privacyPanel: 'These details are handled securely and not stored.',
    coldRent: 'Cold rent (Bruttokaltmiete) €/month',
    coldRentPlaceholder: 'e.g. 750',
    coldRentHint:
      'Enter the cold rent without heating. The app adds the heating component from § 12 WoGG itself.',
    membersTitle: 'Monthly gross income per person',
    membersHint: 'Tick every box that applies. Each one is a 10% deduction under § 16 WoGG.',
    person: 'Person',
    grossPlaceholder: 'Gross in €',
    werbungskosten: 'Work-related expenses (Werbungskosten) €/month',
    werbungskostenHint:
      'Employees: 102.50 € is the standard allowance. Only enter more if your actual costs are higher. For pension or self-employed income, enter your actual costs or 0.',
    checkTax: 'Income tax (Einkommensteuer)',
    checkHealth: 'Statutory health & care insurance',
    checkPension: 'Statutory pension insurance',
    assets: 'Total household assets €',
    assetsPlaceholder: '0 or leave blank',
    assetsHint: 'Needed for § 21 WoGG. Leave it blank if you have no significant savings or property.',
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
    subtitle: 'Each card explains the result and cites the rule it is based on.',
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
      'We don\'t cover this postal code yet. We add regions once we have verified them. Until then, your local Wohngeldbehörde can help.',
    unavailableDefault: 'Temporarily unavailable. This isn\'t caused by anything you did.',
    retry: 'Try again',
    officialSource: 'Official source →',
    cardDisclaimer:
      'This is an estimate, not legal advice. Your local Wohngeldbehörde makes the binding decision.',
    findOffice: 'Find your Wohngeldstelle →',
    pageDisclaimer: 'General information, not legal or tax advice.',
  },

  notFound: {
    title: 'Page not found',
    body: 'This page doesn\'t exist or has moved.',
    backHome: 'Back to the homepage',
  },
};

export type Messages = typeof en;

const de: Messages = {
  meta: {
    home: 'Staatliche Leistungen prüfen | Anspruch',
    check: 'Anspruchs-Check | Anspruch',
    how: 'So funktioniert es | Anspruch',
    privacy: 'Datenschutz | Anspruch',
    notFound: 'Seite nicht gefunden | Anspruch',
    description:
      'Anspruch prüft, ob Ihnen staatliche Leistungen wie Wohngeld zustehen. Jedes Ergebnis wird nach festen Regeln berechnet und mit der amtlichen Quelle verknüpft. Was sich nicht prüfen lässt, sagt Anspruch offen.',
  },

  beta: {
    text: 'Wohngeld-Beträge werden derzeit nur für Würzburg berechnet. Weitere Regionen folgen bald.',
  },

  nav: {
    brandSub: 'Leistungs-Check',
    home: 'Start',
    how: 'So funktioniert es',
    privacy: 'Datenschutz',
    check: 'Check starten',
  },

  footer: {
    tagline: 'Jede Antwort mit Quelle.',
    product: 'Produkt',
    disclaimer:
      'Anspruch bietet allgemeine Informationen, keine Rechts- oder Steuerberatung. Verbindlich entscheidet die zuständige Behörde.',
    copyright: '© 2026 Anspruch',
  },

  home: {
    eyebrow: 'Staatliche Leistungen, richtig geprüft',
    heroTitle: 'Finden Sie heraus, was Ihnen zustehen könnte, belegt mit der amtlichen Regel.',
    heroLead:
      'Anspruch prüft, ob Ihnen staatliche Leistungen wie Wohngeld zustehen. Ein Regelwerk berechnet jedes Ergebnis und verknüpft es mit einer datierten amtlichen Quelle. Lässt sich etwas nicht belegen, sagt Anspruch das, statt zu raten.',
    ctaPrimary: 'Kostenlosen Check starten',
    ctaSecondary: 'So funktioniert es',

    principlesTitle: 'Warum Sie dem Ergebnis vertrauen können',
    principles: [
      {
        title: 'Quelle zitieren oder ablehnen',
        body: 'Jede Aussage stützt sich auf eine datierte amtliche Regel, zum Beispiel das Wohngeldgesetz (WoGG). Gibt es keine Quelle, trifft Anspruch keine Aussage.',
      },
      {
        title: 'Keine geratenen Zahlen',
        body: 'Anspruch und Beträge ergeben sich nur aus einem getesteten Regelwerk. Die KI rechnet nie und kann deshalb keinen Eurobetrag erfinden.',
      },
      {
        title: 'Datenschutz von Anfang an',
        body: 'Einkommen, Miete und Vermögen werden nur für die Prüfung verwendet. Ohne Ihre Zustimmung wird nichts gespeichert, sensible Zahlen landen nie in Protokollen, und Ihr Browser spricht nie mit einem KI-Anbieter.',
      },
    ],

    stepsTitle: 'So läuft die Prüfung ab',
    steps: [
      {
        title: 'Situation beschreiben',
        body: 'Haushaltsgröße, Miete, Einkommen und Postleitzahl. Wir fragen nur, was die Regeln brauchen, und sensible Felder sind markiert.',
      },
      {
        title: 'Die Regeln rechnen',
        body: 'Das Regelwerk nimmt die Fassung, die heute gilt, und prüft damit Ihren Anspruch. Nichts wird geschätzt, und keine KI rechnet mit.',
      },
      {
        title: 'Ergebnisse ansehen',
        body: 'Jede Ergebniskarte nennt ihre Rechtsgrundlage. Fehlt eine Angabe, steht auf der Karte, welche.',
      },
    ],

    programsTitle: 'Was Anspruch prüft',
    programsLead:
      'Anspruch wächst Leistung für Leistung. Jede Leistung ist ein eigenes Regelmodul mit Version und Datum.',
    programWohngeldTitle: 'Wohngeld',
    programWohngeldBody:
      'Die erste Leistung, die Anspruch unterstützt. Jeder Wert der Berechnung stammt aus dem amtlichen Gesetzestext und wurde mit dem Wohngeldrechner des Bundes abgeglichen. Fälle, die noch nicht geprüft sind, zeigt die App als „nicht verfügbar“ statt mit einer Schätzung.',
    programWohngeldStatus: 'Erstes Modul',
    programMoreTitle: 'Weitere Leistungen folgen',
    programMoreBody:
      'Kindergeld, Kinderzuschlag, BAföG und weitere Leistungen funktionieren genauso. Jede bekommt ein eigenes datiertes Regelmodul, das Regelwerk und seine Prüfungen bleiben unverändert.',
    programMoreStatus: 'In Entwicklung',

    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Ist das Rechtsberatung?',
        a: 'Nein. Anspruch bietet allgemeine Informationen. Verbindlich entscheidet die zuständige Behörde, zum Beispiel Ihre Wohngeldbehörde.',
      },
      {
        q: 'Was passiert mit meinen Daten?',
        a: 'Ihre Angaben werden zur Berechnung verwendet und nicht gespeichert, außer Sie stimmen ausdrücklich zu. Sensible Zahlen landen nie in Protokollen, und Ihr Browser sendet nichts an einen KI-Anbieter.',
      },
      {
        q: 'Warum steht manchmal „nicht feststellbar“?',
        a: 'Weil wir bei Ihrem Geld lieber zugeben, dass wir etwas nicht wissen, als falsch zu raten. Die Ergebniskarte nennt die fehlende Angabe. Ergänzen Sie sie, und Sie bekommen eine echte Antwort.',
      },
      {
        q: 'Berechnet eine KI meine Leistung?',
        a: 'Nein. Alle Entscheidungen und Beträge kommen aus einem getesteten Regelwerk. Geplant ist eine KI, die Ergebnisse in einfacher Sprache erklärt. Sie wird nie selbst rechnen, und eine Prüfung wird jede Erklärung blockieren, deren Zahlen vom Regelwerk abweichen.',
      },
    ],

    ctaBoxTitle: 'Prüfen Sie Ihren Anspruch in wenigen Minuten',
    ctaBoxBody: 'Kostenlos und ohne Konto. Ihre Angaben werden nicht gespeichert.',
  },

  how: {
    title: 'So funktioniert Anspruch',
    lead:
      'Wenn es um Geld geht, kann eine falsche Vermutung teuer werden. Anspruch folgt deshalb einer Regel: Quelle nennen oder nicht antworten.',

    pipelineTitle: 'Schritt für Schritt',
    pipeline: [
      {
        title: 'Ihre Situation als strukturierte Daten',
        body: 'Das Formular macht aus Ihren Antworten ein strukturiertes Profil mit Haushalt, Miete, Einkommen und Region. Sensible Felder sind markiert, auf das Nötigste beschränkt und werden nicht gespeichert.',
      },
      {
        title: 'Ein Regelwerk entscheidet',
        body: 'Jede Leistung ist ein versioniertes Regelmodul, übertragen aus datierten amtlichen Quellen. Das Regelwerk nutzt die Fassung, die am Tag Ihrer Prüfung gilt. An der Berechnung ist keine KI beteiligt.',
      },
      {
        title: 'Erklärungen mit Quellen (geplant)',
        body: 'Als Nächstes erklärt eine KI bereits berechnete Ergebnisse in einfacher Sprache und mit den beigefügten Quellen. Enthält eine Erklärung eine Zahl, die nicht vom Regelwerk stammt, wird sie blockiert.',
      },
      {
        title: 'Sie behalten die Kontrolle',
        body: 'Anspruch reicht nie selbst etwas bei einer Behörde ein. Jede künftige Hilfe beim Antrag braucht vorher Ihre ausdrückliche Freigabe.',
      },
    ],

    statesTitle: 'Fünf mögliche Ergebnisse',
    statesLead:
      'Jede Prüfung endet mit einem von fünf Ergebnissen. Zwei davon, „nicht feststellbar“ und „nicht verfügbar“, lassen die meisten Tools einfach weg.',
    states: [
      {
        name: 'Wahrscheinlich berechtigt',
        body: 'Sie erfüllen voraussichtlich die Voraussetzungen. Die Karte zeigt den berechneten Betrag und die Rechtsgrundlage.',
      },
      {
        name: 'Wahrscheinlich berechtigt, ohne Betrag',
        body: 'Sie haben voraussichtlich Anspruch auf eine Leistung, die nicht als Geld ausgezahlt wird, etwa einen Wohnberechtigungsschein.',
      },
      {
        name: 'Wahrscheinlich nicht berechtigt',
        body: 'Nach den Regeln besteht voraussichtlich kein Anspruch. Die Karte nennt den Grund und zeigt ihn neutral, nicht als Misserfolg.',
      },
      {
        name: 'Nicht feststellbar',
        body: 'Eine nötige Angabe fehlt. Die Karte nennt sie, statt die Lücke mit einer Vermutung zu füllen.',
      },
      {
        name: 'Vorübergehend nicht verfügbar',
        body: 'Bei uns ist etwas schiefgelaufen. Die Karte sagt das deutlich, und Sie können es erneut versuchen.',
      },
    ],

    honestyTitle: 'Im Code verankert',
    honestyBody:
      'Ein Ergebnis, das Berechtigung ohne Betrag oder einen Betrag ohne Quelle behauptet, kann das System gar nicht erzeugen. Regeldaten stammen nur aus datierten amtlichen Veröffentlichungen. Ist ein Wert noch nicht geprüft, zeigt die App „nicht verfügbar“ statt einer Zahl, die nur plausibel aussieht.',

    ctaTitle: 'Probieren Sie es aus',
  },

  privacy: {
    title: 'Datenschutz',
    lead:
      'Anspruch verarbeitet Einkommen, Miete und Haushaltsdaten und erhebt deshalb so wenig wie möglich. Hier steht in einfachen Worten, was mit diesen Daten passiert.',
    sections: [
      {
        title: 'Was wir verarbeiten',
        body: 'Nur, was die Leistungsregeln brauchen: Haushaltsgröße, Aufenthaltsstatus, Postleitzahl, Miete, Einkommen und gegebenenfalls Vermögen. Sensible Felder sind im Formular markiert.',
      },
      {
        title: 'Wie wir verarbeiten',
        body: 'Ihre Angaben dienen nur der Berechnung und werden nicht gespeichert, außer Sie stimmen ausdrücklich zu. Wird etwas gespeichert, dann verschlüsselt. Sensible Zahlen landen nie in Protokollen, und die Verarbeitung findet in der EU statt.',
      },
      {
        title: 'Was nie passiert',
        body: 'Ihr Browser kontaktiert nie einen KI-Anbieter. Jede Anfrage geht an das Anspruch-Backend und nirgendwo sonst hin. Die Seite setzt keine Werbe- oder Tracking-Cookies und lädt keine Schriften oder Skripte von Dritten.',
      },
      {
        title: 'Ihre Rechte',
        body: 'Nach der DSGVO können Sie Auskunft, Berichtigung und Löschung Ihrer Daten verlangen. Da standardmäßig nichts gespeichert wird, gibt es meist nichts zu löschen. Haben Sie eine Prüfung gespeichert, können Sie sie jederzeit löschen lassen.',
      },
    ],
    legalNote:
      'Vor dem öffentlichen Start kommen eine vollständige Datenschutzerklärung und ein Impressum hinzu, wie es das deutsche Recht verlangt.',
  },

  check: {
    title: 'Anspruchs-Check',
    lead: 'Ein paar Fragen zu Ihrem Haushalt. Sensible Angaben werden nicht gespeichert.',
    sampleNote: 'Das sind Beispielergebnisse. Verbinden Sie das Backend, um echte zu sehen.',
    backendDown: 'Das Backend ist noch nicht erreichbar, deshalb sehen Sie weiter Beispielergebnisse.',
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
    municipalityHint: '(nur, wenn die App danach fragt)',
    optional: 'optional',
    age: 'Alter',
    householdSize: 'Personen im Haushalt',
    privacyPanel: 'Diese Angaben werden sicher verarbeitet und nicht gespeichert.',
    coldRent: 'Kaltmiete (Bruttokaltmiete) €/Monat',
    coldRentPlaceholder: 'z. B. 750',
    coldRentHint:
      'Nur die Kaltmiete ohne Heizkosten angeben. Die Heizkomponente nach § 12 WoGG rechnet die App selbst dazu.',
    membersTitle: 'Monatliches Bruttoeinkommen je Person',
    membersHint: 'Alles Zutreffende ankreuzen. Jedes Kreuz ist ein Abzug von 10 % nach § 16 WoGG.',
    person: 'Person',
    grossPlaceholder: 'Brutto in €',
    werbungskosten: 'Werbungskosten €/Monat',
    werbungskostenHint:
      'Arbeitnehmer:innen: 102,50 € ist der Arbeitnehmer-Pauschbetrag. Mehr nur eintragen, wenn Ihre tatsächlichen Kosten höher sind. Bei Rente oder selbstständigen Einkünften die tatsächlichen Kosten oder 0 eintragen.',
    checkTax: 'Einkommensteuer',
    checkHealth: 'Gesetzliche Kranken- und Pflegeversicherung',
    checkPension: 'Gesetzliche Rentenversicherung',
    assets: 'Gesamtvermögen des Haushalts €',
    assetsPlaceholder: '0 oder freilassen',
    assetsHint: 'Wichtig für § 21 WoGG. Leer lassen, wenn Sie kein nennenswertes Erspartes oder Eigentum haben.',
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
    subtitle: 'Jede Karte erklärt das Ergebnis und nennt die Regel, auf der es beruht.',
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
      'Diese Postleitzahl ist noch nicht abgedeckt. Wir nehmen Regionen auf, sobald sie geprüft sind. Bis dahin hilft Ihre Wohngeldbehörde weiter.',
    unavailableDefault: 'Vorübergehend nicht verfügbar. Das liegt nicht an Ihnen.',
    retry: 'Erneut versuchen',
    officialSource: 'Amtliche Quelle →',
    cardDisclaimer:
      'Dies ist eine Einschätzung, keine Rechtsberatung. Verbindlich entscheidet Ihre Wohngeldbehörde.',
    findOffice: 'Wohngeldstelle finden →',
    pageDisclaimer: 'Allgemeine Informationen, keine Rechts- oder Steuerberatung.',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    body: 'Diese Seite gibt es nicht oder sie wurde verschoben.',
    backHome: 'Zurück zur Startseite',
  },
};

export const messages: Record<Lang, Messages> = { de, en };
