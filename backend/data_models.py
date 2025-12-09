"""
Data Models for Export Compliance Agent
---------------------------------------
Defines structured objects for the Agent's inputs and outputs.
Uses standard Python dataclasses for compatibility and clarity.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

@dataclass
class ShipmentCase:
    """Canonical representation of a shipment scenario."""
    eccn: Optional[str] = None
    destination: Optional[str] = None
    value: float = 0.0
    quantity: int = 1
    end_user_type: str = "Commercial"  # Commercial, Government, Individual, Military
    end_user_name: Optional[str] = None # For DPS
    supplier_name: Optional[str] = None # For UFLPA
    commodity_description: Optional[str] = None # For UFLPA
    origin_country: Optional[str] = None # For UFLPA
    end_use: Optional[str] = None # Purpose of use
    is_reexport: bool = False
    unit: str = "units"

    def to_dict(self) -> Dict[str, Any]:
        return {k: v for k, v in self.__dict__.items() if v is not None}

@dataclass
class LicenseResult:
    """Structured result from the License Exception Engine."""
    status: str  # CLEAR, WARNING, RESTRICTED, MISSING_DATA
    exceptions: List[Dict[str, Any]] = field(default_factory=list)
    trace: List[str] = field(default_factory=list)
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self):
        return {
            "status": self.status,
            "exceptions": self.exceptions,
            "trace": self.trace,
            "details": self.details
        }

@dataclass
class ScreeningResult:
    """Structured result from DPS or UFLPA engines."""
    engine: str  # "DPS" or "UFLPA"
    outcome: str # CLEAR, MATCH, WARNING
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    matches: List[Dict[str, Any]] = field(default_factory=list)
    reasoning: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "engine": self.engine,
            "outcome": self.outcome,
            "risk_level": self.risk_level,
            "matches": self.matches,
            "reasoning": self.reasoning
        }


@dataclass
class AgentMessage:
    """A single bubble in the agent's response stream."""
    role: str # "assistant", "system", "user"
    role: str # "assistant", "system", "user"
    kind: str # "text", "clarification", "compliance_hero", "exception_grid", "risk_box", "logic_trace", "next_steps"
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

    def to_dict(self):
        return {
            "role": self.role,
            "kind": self.kind,
            "content": self.content,
            "data": self.data
        }

@dataclass
class AgentResponse:
    """Top-level response object from the /agent endpoint."""
    shipment: ShipmentCase
    messages: List[AgentMessage] # Unified message stream
    mood: str # "idle", "success", "warning"
    intent: str
    needs_clarification: bool = False
    
    # Deprecated fields (kept briefly for safety, but effectively replaced by messages)
    missing_fields: List[str] = field(default_factory=list)
    license_result: Optional[LicenseResult] = None
    screenings: List[ScreeningResult] = field(default_factory=list)

    def to_dict(self):
        return {
            "shipment": self.shipment.to_dict(),
            "messages": [m.to_dict() for m in self.messages],
            "mood": self.mood,
            "intent": self.intent,
            "needs_clarification": self.needs_clarification,
            # Legacy fallbacks for older frontend checks if needed temporarily
            "license_result": self.license_result.to_dict() if self.license_result else None,
            "screenings": [s.to_dict() for s in self.screenings],
            "missing_fields": self.missing_fields
        }
