// Intelligence Hub v10 — ratified preferences and scarce monitoring configuration.
// These objects are declarative Phase 1 data. They do not replace v9.x ranking or feeds.

export const PERSON_INGESTION_PREFERENCES = Object.freeze({
  "person-ethan-mollick": Object.freeze(["original", "social", "appearances"]),
  "person-arvind-narayanan": Object.freeze(["original", "social", "appearances"]),
  "person-simon-willison": Object.freeze(["original", "social"]),
  "person-andrej-karpathy": Object.freeze(["original", "social", "appearances"]),
  "person-paul-ford": Object.freeze(["original", "appearances"]),
  "person-benedict-evans": Object.freeze(["original", "social"]),
  "person-dario-amodei": Object.freeze(["original", "appearances"])
});

export const PERSON_CONVERGENCE_MODE = "cluster-and-highlight-independent-priority-convergence";

export const ORGANIZATION_ACTIVITY_PREFERENCES = Object.freeze({
  "org-anthropic": Object.freeze(["product", "research", "leadership"]),
  "org-openai": Object.freeze(["product", "research", "official-announcements"]),
  "org-google": Object.freeze(["product", "research", "official-announcements"]),
  "org-educause": Object.freeze(["research", "governance-policy", "official-announcements"]),
  "org-stanford-hai": Object.freeze(["research"])
});

export const PRODUCT_SIGNAL_PREFERENCES = Object.freeze({
  "product-chatgpt": Object.freeze(["features", "model", "workflow-ui", "documentation"]),
  "product-claude": Object.freeze(["features", "model", "workflow-ui", "documentation"]),
  "product-gemini": Object.freeze(["features", "model", "workflow-ui", "documentation"]),
  "product-notebooklm": Object.freeze(["features", "integrations", "workflow-ui", "documentation"]),
  "product-google-labs": Object.freeze(["features", "release-notes"]),
  "product-canvas": Object.freeze(["features", "integrations", "workflow-ui"])
});

export const PRODUCT_CHANGE_POLICY = Object.freeze({
  minimumSignificance: "meaningful-workflow-affecting",
  familyModel: "parent-child",
  experimentalRule: "track-when-core-watchlist-relevant"
});

export const PUBLICATION_BEHAVIORS = Object.freeze({
  "publication-hbr": "topic-match",
  "publication-mit-technology-review": "topic-match",
  "publication-every": "smart",
  "publication-stratechery": "topic-match",
  "publication-chronicle-higher-education": "topic-match",
  "publication-write-with-ai": "topic-match"
});

export const PUBLICATION_RULES = Object.freeze({
  canonicalArticleAcrossFormats: true,
  preferPrimarySourceAsClusterAnchor: true,
  classifyAnalysisOpinionSeparately: true
});

export const MEDIA_TRIGGERS = Object.freeze({
  "media-ai-daily-brief": "smart",
  "media-ai-and-i": "all",
  "media-cognitive-revolution": "topic-or-entity",
  "media-hard-fork": "topic",
  "media-practical-ai": "topic"
});

export const MEDIA_RULES = Object.freeze({
  activeDefaultTrigger: "topic-or-entity",
  priorityGuestDiscovery: true,
  transcriptAsEpisodeContent: true,
  canonicalizeMultiFormatEpisode: true,
  officialOrgChannelsRemainEndpoints: true,
  independentYoutubeIngestion: "smart",
  indexVideoMetadataImmediately: true,
  enrichTranscriptWhenFeasible: true,
  excludeYoutubeShortsByDefault: true
});

export const RESEARCH_CONFIGURATION = Object.freeze({
  domains: Object.freeze({
    core: Object.freeze([
      "AI adoption & workplace productivity",
      "AI in education / learning outcomes",
      "Prompting & human-AI interaction",
      "RAG, grounding & retrieval",
      "Creative AI / writing quality"
    ]),
    active: Object.freeze([
      "Future of work / labor economics",
      "Assessment, grading & formative feedback",
      "Human-AI collaboration / judgment",
      "Context, memory & agent systems"
    ]),
    parked: Object.freeze([
      "AI governance / regulation",
      "General frontier-model research"
    ])
  }),
  preferredEvidence: Object.freeze([
    "peer-reviewed",
    "working-paper-preprint",
    "randomized-controlled-experiment",
    "longitudinal-study",
    "field-study-real-workplace",
    "systematic-review-meta-analysis",
    "institutional-report-index"
  ]),
  sourceIds: Object.freeze({
    use: Object.freeze([
      "research-source-arxiv",
      "research-source-ssrn",
      "research-source-nber",
      "research-source-semantic-scholar",
      "research-source-google-scholar",
      "org-stanford-hai",
      "research-source-wharton",
      "org-educause",
      "org-anthropic",
      "research-source-eric"
    ]),
    park: Object.freeze([
      "org-oecd-ai",
      "org-microsoft",
      "org-openai",
      "org-hugging-face"
    ]),
    discoveryOnly: Object.freeze([
      "research-source-consensus",
      "research-source-elicit"
    ])
  }),
  nberChildFilter: "Economics of AI Working Group",
  focusSignals: Object.freeze([
    "core-research-domain",
    "core-watchlist-facet",
    "strong-methodology-meaningful-sample",
    "priority-institution",
    "priority-author",
    "active-question-project",
    "multi-priority-discussion"
  ]),
  nonSignals: Object.freeze(["citation-popularity-alone", "newness-alone"])
});

export const COMMUNITY_CONFIGURATION = Object.freeze({
  coreRules: Object.freeze({
    "community-reddit-promptengineering": Object.freeze(["practical-firsthand", "high-quality-discussion"]),
    "community-reddit-notebooklm": Object.freeze(["practical-firsthand", "priority-entity-product"]),
    "community-canvas": Object.freeze(["practical-firsthand", "topic-match"]),
    "community-reddit-writingwithai": Object.freeze([])
  }),
  unresolvedCoreRuleIds: Object.freeze(["community-reddit-writingwithai"]),
  pendingVerificationIds: Object.freeze([
    "community-reddit-chatgptpromptgenius",
    "community-reddit-hermesagent",
    "community-reddit-bookwritingai",
    "community-reddit-linguisticsprograming"
  ]),
  focusFavor: Object.freeze([
    "firsthand-user-experience",
    "workarounds-limitations",
    "practical-workflows",
    "repeated-emerging-concern"
  ]),
  popularityAlonePromotes: false,
  convergenceMode: "cluster-representative-posts",
  unverifiedOfficialChangeMode: "community-report-unverified-then-update"
});

export const EVENT_CONFIGURATION = Object.freeze({
  opportunityTypes: Object.freeze({
    discover: Object.freeze(["hands-on-workshop-lab", "short-course-bootcamp"]),
    highlyRelevantOnly: Object.freeze([
      "webinar-virtual-talk",
      "conference",
      "conference-session-keynote",
      "self-paced-course",
      "professional-training-program",
      "university-academic-seminar",
      "product-training-vendor-academy",
      "community-meetup-discussion",
      "call-for-papers-proposals-presentations"
    ]),
    ignore: Object.freeze(["certification-credential"])
  }),
  domains: Object.freeze({
    core: Object.freeze([
      "Enterprise AI adoption & workforce enablement",
      "AI in teaching & learning",
      "Prompting & AI workflow design",
      "AI-assisted writing & creative workflows"
    ]),
    active: Object.freeze([
      "Instructional design / assessment",
      "RAG / knowledge management / research workflows",
      "AI agents for knowledge workers",
      "Multimodal / visual creation"
    ]),
    parked: Object.freeze([
      "AI policy / governance",
      "General AI/product education"
    ])
  }),
  providerIds: Object.freeze({
    priority: Object.freeze([
      "org-microsoft",
      "org-google",
      "org-anthropic",
      "org-kpmg",
      "publication-every"
    ]),
    active: Object.freeze([
      "org-openai",
      "org-stanford-hai",
      "org-wharton-interactive",
      "publication-hbr",
      "org-outskill"
    ]),
    parked: Object.freeze([
      "org-educause",
      "org-instructure",
      "org-section"
    ])
  }),
  attachedEventEndpointEntityIds: Object.freeze([
    "media-ai-daily-brief",
    "person-nufar-gaspar",
    "person-azeem-azhar",
    "publication-the-neuron"
  ]),
  scoringSignals: Object.freeze([
    "current-work-applicability",
    "course-applicability",
    "active-writing-research-project",
    "immediately-practicable",
    "hands-on",
    "priority-person",
    "original-research-evidence",
    "reusable-templates-resources",
    "asynchronous-afterward"
  ]),
  focusThreshold: "exceptional-realistically-register",
  weekdayWebinarPreferredMinutesMax: 60,
  courseWorkshopPreferredHoursMax: 5,
  costPolicy: "secondary-to-value",
  postEventArtifactMode: "convert-recording-transcript-materials-to-media-library",
  calendarCommitmentEffect: "boost-not-guarantee"
});

export const LIBRARY_CONFIGURATION = Object.freeze({
  include: Object.freeze([
    "readwise-highlights",
    "book-metadata",
    "podcast-video-transcripts",
    "event-recordings-materials",
    "saved-web-pages-after-deliberate-promotion"
  ]),
  separateByDefault: Object.freeze([
    "read-articles",
    "encountered-research-papers-pdfs"
  ]),
  excludeByDefault: Object.freeze([
    "own-notes",
    "published-writing",
    "draft-working-documents",
    "teaching-course-materials"
  ]),
  capabilities: Object.freeze([
    "full-text-search",
    "watchlist-topic-matching",
    "surface-past-material-on-new-story",
    "connect-research-to-highlights",
    "identify-contradictions-over-time",
    "suggest-related-material-in-questions",
    "periodic-resurfacing",
    "summarize-previous-reading",
    "show-previous-encounter",
    "focus-relevance-signal"
  ])
});

export const SAVED_CONFIGURATION = Object.freeze({
  meaning: "durable-intentional-capture",
  impliesLearned: false,
  lifecycle: "permanent-with-unread-read-archive",
  autoClassify: true,
  userCanCorrectClassification: true,
  routineReminderInFocus: false
});

export const BOOKMARK_CONFIGURATION = Object.freeze({
  roles: Object.freeze(["manager", "launchpad", "searchable-directory"]),
  bookmarkedProductCreatesKnownEntity: true,
  categoriesMayInformInterests: true,
  usableInQuestions: true,
  startsMonitoring: false,
  passiveFrequencyRankingWeight: 0
});

export const PERSONAL_CONFIGURATION = Object.freeze({
  allowedInputs: Object.freeze([
    "web-url",
    "rss-atom-url",
    "private-feed-url",
    "google-drive-doc",
    "pdf",
    "newsletter-email-source",
    "youtube-video-url",
    "github-repository",
    "custom-search-query",
    "plain-text-note"
  ]),
  classificationMode: "suggest-entity-lens-user-approves",
  allowedSurfaces: Object.freeze(["questions", "search", "library-when-deliberately-added"]),
  forbiddenSurfaces: Object.freeze(["focus", "trends-signals", "unattributed-public-claims"]),
  requirePrivateProvenance: true
});

export const RETENTION_CONFIGURATION = Object.freeze({
  generalUnsavedFeedDays: 90
});

export const QUESTION_CONFIGURATION = Object.freeze({
  modes: Object.freeze([
    "one-time",
    "deep-research",
    "saved",
    "monitored",
    "comparison",
    "evidence-check",
    "trend",
    "source-discovery"
  ]),
  execution: "plan-first-user-approval",
  defaultSpaces: Object.freeze([
    "watchlist",
    "people",
    "organizations",
    "products",
    "publications",
    "research",
    "media",
    "communities",
    "library",
    "saved"
  ]),
  optionalSpaces: Object.freeze(["bookmarks", "personal-private"]),
  outputs: Object.freeze([
    "research-brief",
    "evidence-table",
    "compare-contrast-table",
    "timeline",
    "key-findings-limitations",
    "source-list",
    "exportable-report"
  ]),
  retain: Object.freeze([
    "original-question",
    "refined-question",
    "search-terms",
    "included-excluded-sources",
    "research-plan-subquestions",
    "previous-answer",
    "supporting-evidence",
    "personal-notes",
    "changes-since-previous-run"
  ]),
  monitorTriggers: Object.freeze([
    "new-high-quality-research",
    "multi-source-convergence",
    "existing-evidence-contradicted",
    "material-conclusion-change"
  ]),
  updateFrequency: "per-question",
  canPromoteToWatchlist: true,
  followupMode: "genuine-unresolved-issue-only",
  monitoredMax: 5
});

export const FOCUS_CONFIGURATION = Object.freeze({
  implementationStatus: "deferred-until-phase-15",
  allowedObjectTypes: Object.freeze([
    "high-value-item",
    "research",
    "product-change",
    "priority-person-publication-appearance",
    "community-signal",
    "exceptional-event",
    "monitored-question-update",
    "story-cluster",
    "trend-signal",
    "library-resurfacing"
  ]),
  promotionWeights: Object.freeze({
    coreWatchlistFacet: 3,
    activeQuestionProject: 3,
    strongEmpiricalEvidence: 3,
    independentSourceConvergence: 3,
    priorityPerson: 2,
    priorityOrganization: 2,
    meaningfulPriorityProductChange: 2,
    officialPrimarySource: 2,
    firsthandPractitionerEvidence: 2,
    contradictsExistingConclusion: 3,
    strongLibraryConnection: 2,
    activeEntityMatch: 1,
    popularityEngagement: 0,
    recency: 1
  }),
  hardEligibility: Object.freeze([
    "high-quality-core-domain-research",
    "material-active-question-change",
    "strong-reliable-source-convergence"
  ]),
  structure: Object.freeze([
    "worth-your-attention",
    "signals",
    "research-evidence",
    "questions",
    "coming-up"
  ]),
  worthYourAttentionMax: 8,
  beforeShowMoreMax: 15,
  diversityMode: "cluster-first-then-caps",
  signalMaturity: Object.freeze(["weak", "emerging", "established", "reversing"]),
  popularityCanCreateSignal: false,
  explainRankingVisible: true,
  summaryMode: "what-happened-why-it-matters",
  passiveBehaviorRanking: false,
  defaultPushAlerts: false,
  refreshMode: "continuous-ingestion-material-outrank-only"
});
