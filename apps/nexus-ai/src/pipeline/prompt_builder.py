from dataclasses import dataclass


@dataclass
class TenantConfig:
    system_prompt: str
    persona: str
    objective: str
    rules: list[str]
    guardrails: list[str]
    context_sources: list[dict]
    model: str
    temperature: float


def build_prompt(config: TenantConfig, history: list[dict], inbound: str) -> list[dict]:
    messages = []

    # Layer 1: System base
    messages.append({"role": "system", "content": _build_system(config)})

    # Layer 5: Conversation history
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Current message
    messages.append({"role": "user", "content": inbound})

    return messages


def _build_system(config: TenantConfig) -> str:
    parts = [config.system_prompt]

    # Layer 2: Persona
    if config.persona:
        parts.append(f"\n## Persona\n{config.persona}")

    # Layer 3: Objective & rules
    if config.objective:
        parts.append(f"\n## Objetivo\n{config.objective}")
    if config.rules:
        parts.append("\n## Regras\n" + "\n".join(f"- {r}" for r in config.rules))

    # Layer 6: Guardrails (always last, clearly separated)
    if config.guardrails:
        parts.append(
            "\n## RESTRICOES (inviolaveis)\n"
            + "\n".join(f"- {g}" for g in config.guardrails)
        )

    return "\n".join(parts)
