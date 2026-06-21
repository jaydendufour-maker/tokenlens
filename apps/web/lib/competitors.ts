/**
 * Concurrent-/alternatief-pagina's = hoogste koopintentie in SEO.
 * Wie "<tool> alternative" zoekt is klaar om te wisselen.
 *
 * Regel: eerlijk blijven. We trashen niemand, we positioneren op de wedge
 * (kosten-attributie per customer/feature/team). Elke entry zegt óók wanneer
 * je beter bij de concurrent blijft — dat bouwt vertrouwen en converteert beter.
 */

export interface Competitor {
  slug: string;
  name: string;
  /** Korte categorie, bv. "LLM observability". */
  category: string;
  /** Wat het is — fair, 1-2 zinnen. */
  whatItIs: string;
  /** Waar ze sterk in zijn (eerlijk). */
  strengths: string[];
  /** De specifieke gap die TokenLens vult t.o.v. deze tool. */
  gap: string;
  /** Wanneer TokenLens de betere keuze is. */
  switchIf: string[];
  /** Eerlijk: wanneer je beter bij hen blijft. */
  stayIf: string[];
}

export const COMPETITORS: Competitor[] = [
  {
    slug: "helicone",
    name: "Helicone",
    category: "LLM observability (open source)",
    whatItIs:
      "An open-source observability proxy/SDK for LLM apps — logging, request tracing, caching and usage metrics, with a hosted option.",
    strengths: [
      "Mature logging + request tracing across providers",
      "Proxy-based setup means little code change",
      "Caching and rate-limit features beyond pure analytics",
    ],
    gap: "Helicone supports user analytics, custom properties and alerts inside a broad request-observability platform. TokenLens is narrower: metadata-only cost attribution without a proxy or prompt/response logging, organized directly around spend per business dimension.",
    switchIf: [
      "Your main question is \"which customer/feature is this spend?\", not \"what did this request do?\"",
      "You want budget alerts per customer/feature/team, not just dashboards",
      "You want a zero-dependency SDK you can drop in without a proxy",
    ],
    stayIf: [
      "You need full request/response logging, replay, and prompt debugging",
      "You already rely on Helicone's caching or gateway features",
    ],
  },
  {
    slug: "langfuse",
    name: "Langfuse",
    category: "LLM tracing & evaluation (open source)",
    whatItIs:
      "An open-source LLM engineering platform focused on tracing, prompt management, evals and analytics, popular with teams building agents and RAG.",
    strengths: [
      "Deep tracing of multi-step / agent chains",
      "Prompt management and evaluation tooling",
      "Strong open-source community and integrations",
    ],
    gap: "Langfuse combines tracing, evals, prompt management, cost metrics and monitors. TokenLens deliberately avoids that platform surface: metadata-only cost attribution per customer/feature/team, without storing prompts or responses.",
    switchIf: [
      "You don't need full tracing/evals — you need to know who is spending",
      "You want a single small SDK + a cost dashboard, not a platform to learn",
      "Per-dimension budget alerts matter more than trace depth",
    ],
    stayIf: [
      "You're debugging agent chains and need span-level traces and evals",
      "You've standardized your team on Langfuse already",
    ],
  },
  {
    slug: "langsmith",
    name: "LangSmith",
    category: "LLM tracing (LangChain)",
    whatItIs:
      "LangChain's hosted platform for tracing, testing and monitoring LLM applications, tightly integrated with the LangChain/LangGraph ecosystem.",
    strengths: [
      "First-class LangChain / LangGraph integration",
      "Trace, test and dataset tooling for chains",
      "Good fit if you already build on LangChain",
    ],
    gap: "LangSmith is trace-first and ecosystem-bound. TokenLens is provider-agnostic and cost-first: tag any OpenAI/Anthropic call — LangChain or not — and get cost per customer/feature/team plus alerts.",
    switchIf: [
      "You're not on LangChain, or use multiple frameworks",
      "You care about cost attribution and budgets, not trace inspection",
      "You want an SDK with zero framework lock-in",
    ],
    stayIf: [
      "Your stack is LangChain/LangGraph end to end",
      "You need LangSmith's eval/dataset workflows",
    ],
  },
  {
    slug: "portkey",
    name: "Portkey",
    category: "AI gateway + observability",
    whatItIs:
      "An AI gateway that routes/fallbacks across providers and adds observability, guardrails and caching on top of the routing layer.",
    strengths: [
      "Gateway features: routing, fallbacks, load-balancing",
      "Guardrails and caching at the gateway",
      "Observability bundled with the routing layer",
    ],
    gap: "Portkey's center of gravity is the gateway. If you don't want to route your traffic through one, but you do want clean cost attribution, TokenLens gives you the cost layer without adopting a gateway — a small SDK, your traffic untouched.",
    switchIf: [
      "You don't want to route production traffic through a gateway",
      "You want cost attribution + alerts as a standalone layer",
      "A zero-dependency SDK beats a routing dependency for you",
    ],
    stayIf: [
      "You actually want routing/fallbacks/load-balancing across providers",
      "Gateway-level caching and guardrails are on your roadmap",
    ],
  },
  {
    slug: "datadog-llm-observability",
    name: "Datadog LLM Observability",
    category: "APM suite add-on",
    whatItIs:
      "Datadog's LLM module, which brings prompt/trace monitoring into the broader Datadog APM and infrastructure-monitoring suite.",
    strengths: [
      "Unified with the rest of your Datadog telemetry",
      "Enterprise-grade dashboards, alerting and RBAC",
      "Good if you're already a Datadog shop",
    ],
    gap: "Datadog is an enterprise suite priced and scoped accordingly. For a small team that just needs to attribute LLM spend to customers and features without an enterprise contract, TokenLens is a fraction of the weight and cost — and the SDK is open source.",
    switchIf: [
      "You're not already paying for Datadog and don't want to be",
      "You want cost attribution without enterprise onboarding",
      "Budget and team size make a suite overkill",
    ],
    stayIf: [
      "You're already standardized on Datadog across the org",
      "You need enterprise RBAC, SSO and unified APM",
    ],
  },
  {
    slug: "openai-usage-dashboard",
    name: "the OpenAI usage dashboard",
    category: "Provider-native billing view",
    whatItIs:
      "The built-in usage/billing dashboard from your provider (OpenAI, Anthropic). It's free and shows what you spent in total, by day and by API key.",
    strengths: [
      "Free and already there",
      "Accurate totals straight from the provider",
      "Per-API-key breakdown if you split keys",
    ],
    gap: "It answers \"what did I spend\", never \"who or what spent it\" — unless you mint a separate API key per customer/feature, which doesn't scale. TokenLens attributes spend by tags on the call, across providers, in one place, with alerts.",
    switchIf: [
      "You can't tell which customer or feature drives your bill",
      "You use more than one provider and want one view",
      "You want budget alerts the provider dashboard doesn't offer",
    ],
    stayIf: [
      "You only need the monthly total and you're on one provider",
      "Your usage is small enough that attribution doesn't matter yet",
    ],
  },
];

export function competitorBySlug(slug: string): Competitor | undefined {
  return COMPETITORS.find((c) => c.slug === slug);
}
