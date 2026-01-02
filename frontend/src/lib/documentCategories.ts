export interface DocumentCategory {
    id: string;
    label: string;
    description: string;
    warning?: string;
    warningLevel?: "info" | "warning" | "danger";
}

export const documentCategories: DocumentCategory[] = [
    {
        id: "general_contract",
        label: "General Contract",
        description: "Service agreements, NDAs, employment contracts (non-executive), vendor agreements, etc.",
        warning: "Legal Basis: Evidence Act 2011 (S.84–93); Cybercrimes Act 2015 (S.17)",
        warningLevel: "info",
    },
    {
        id: "loan_agreement",
        label: "Loan Agreement",
        description: "Consumer or SME loan contracts, promissory notes",
        warning: "Legal Basis: Evidence Act 2011 (S.84–93)",
        warningLevel: "info",
    },
    {
        id: "lease_short",
        label: "Short-Term Lease (<3 years)",
        description: "Residential or commercial rental agreements under 3 years",
        warning: "Legal Basis: Cybercrimes Act 2015 (S.17)",
        warningLevel: "info",
    },
    {
        id: "invoice",
        label: "Invoice / Payment Acknowledgment",
        description: "Billing documents, payment confirmations",
        warning: "Legal Basis: Commercial practice; Evidence Act",
        warningLevel: "info",
    },
    {
        id: "gift_deed",
        label: "Gift Deed",
        description: "Voluntary transfer of property without consideration",
        warning: "Gift deeds may require physical execution, witness attestation, and registration at the Lands Registry to be legally enforceable in Nigeria.",
        warningLevel: "warning",
    },
    {
        id: "power_of_attorney_land",
        label: "Power of Attorney (Land-Related)",
        description: "POA authorizing land transactions, mortgages, or property sales",
        warning: "Powers of Attorney affecting land must typically be registered at your State Lands Registry. Electronic signing alone may not suffice.",
        warningLevel: "warning",
    },
    {
        id: "affidavit",
        label: "Affidavit / Statutory Declaration",
        description: "Sworn statements for court or official use",
        warning: "Affidavits must be sworn before a Notary Public or Commissioner for Oaths in person under Nigerian law. Electronic signatures are not accepted.",
        warningLevel: "warning",
    },
    {
        id: "marriage_contract",
        label: "Marriage or Prenuptial Agreement",
        description: "Agreements related to marital rights or property division",
        warning: "Family law documents often require judicial review, notarization, or customary formalities. E-signatures may not be legally sufficient.",
        warningLevel: "warning",
    },
    {
        id: "adoption",
        label: "Adoption Papers",
        description: "Legal documents for child adoption",
        warning: "Adoption requires court approval and formal legal process. Electronic signing is not recognized for final adoption orders.",
        warningLevel: "warning",
    },
    {
        id: "will",
        label: "Will or Codicil",
        description: "Last will and testament or amendments",
        warning: "Under Nigerian law (Wills Act), wills MUST be signed in wet ink, in the physical presence of two witnesses. Electronic signatures are INVALID for wills.",
        warningLevel: "danger",
    },
    {
        id: "land_deed",
        label: "Land Deed / Conveyance",
        description: "Deeds for sale, mortgage, or transfer of land",
        warning: "Land transactions require physical execution, notarization, and registration at the State Lands Registry. Electronic signatures alone are not legally binding.",
        warningLevel: "danger",
    },
];

export function getCategoryById(id: string): DocumentCategory | undefined {
    return documentCategories.find((cat) => cat.id === id);
}

export function getCategoryLabel(id: string): string {
    const category = getCategoryById(id);
    if (category) return category.label;

    // Fallback: Convert snake_case or kebab-case to Title Case
    // e.g., "general_contract" -> "General Contract"
    if (!id) return "Unknown Category";

    return id
        .split(/[_-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}
