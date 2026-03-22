import { useMemo } from "react";
import { Users, Euro, Map, TrendingUp, UserCheck, UserPlus, Clock } from "lucide-react";

interface Registration {
    _id: string;
    name: string;
    email: string;
    role: string; // "deelnemer" | "begeleider" | "vrijwilliger"
    distance?: string; // "2.5", "6", "10", "15"
    status: string; // "paid", "pending", "cancelled"
    createdAt: number;
    amount?: number; // Optional, if we have custom amounts. Otherwise we estimate.
    userType?: string;
    city?: string;
    wheelchairUser?: boolean;
    shuttleBus?: string; // "pendelbus" | "eigen-vervoer"
    livesInFacility?: boolean;
    participantType?: string; // "doelgroep" | "verwant" | "anders"
    /** Embedded groepsleden (begeleider groepsregistratie) */
    groupMembers?: { name: string; distance?: string; wheelchairUser?: boolean }[];
}

interface DashboardStats {
    totalRevenue: number;
    totalParticipants: number;
    newToday: number;
    participantsByDistance: Record<string, number>;
    participantsByRole: Record<string, number>;
    participantsByUserType: Record<string, number>;
    uniqueReach: number;
    topDomains: { domain: string, count: number }[];
    recentRegistrations: Registration[];
    logistics: {
        wheelchairCount: number;
        shuttleBusCount: number;
        facilityCount: number;
        participantTypeBreakdown: Record<string, number>;
    };
}

// Estimated pricing for revenue calculation if not in DB
const PRICE_MAP: Record<string, number> = {
    "2.5": 5, // €5.00
    "6": 7.50, // €7.50
    "10": 10, // €10.00
    "15": 12.50 // €12.50
};

const DEFAULT_PRICE = 5; // Fallback

export function useDashboardStats(registrations: Registration[] | undefined): DashboardStats {
    return useMemo(() => {
        if (!registrations) {
            return {
                totalRevenue: 0,
                totalParticipants: 0,
                newToday: 0,
                participantsByDistance: {},
                participantsByRole: {},
                participantsByUserType: {},
                uniqueReach: 0,
                topDomains: [],
                recentRegistrations: [],
                logistics: {
                    wheelchairCount: 0,
                    shuttleBusCount: 0,
                    facilityCount: 0,
                    participantTypeBreakdown: {},
                }
            };
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        let revenue = 0;
        let newTodayCount = 0;
        const distMap: Record<string, number> = { "2.5": 0, "6": 0, "10": 0, "15": 0 };
        const roleMap: Record<string, number> = { "deelnemer": 0, "begeleider": 0, "vrijwilliger": 0 };
        const domainMap: Record<string, number> = {};
        const userTypeMap: Record<string, number> = { "authenticated": 0, "guest": 0 };
        const uniqueEmails = new Set<string>();
        let wheelchairCount = 0;
        let shuttleBusCount = 0;
        let facilityCount = 0;
        const participantTypeMap: Record<string, number> = { "doelgroep": 0, "verwant": 0, "anders": 0 };

        registrations.forEach(reg => {
            // Unique Emails
            if (reg.email) {
                uniqueEmails.add(reg.email.toLowerCase());

                // Domain Stats
                const domain = reg.email.split('@')[1]?.toLowerCase();
                if (domain) {
                    domainMap[domain] = (domainMap[domain] || 0) + 1;
                }
            }

            // User Type
            const type = reg.userType === "authenticated" ? "authenticated" : "guest";
            userTypeMap[type]++;

            // Count Roles — begeleider telt als groepsleden, deelnemer telt zichzelf
            if (reg.role === "begeleider") {
                roleMap["begeleider"]++;
                // Groepsleden zijn de werkelijke deelnemers onder deze begeleider
                const memberCount = reg.groupMembers?.length ?? 0;
                roleMap["deelnemer"] = (roleMap["deelnemer"] || 0) + memberCount;
            } else if (reg.role === "deelnemer") {
                roleMap["deelnemer"]++;
                // Individuele deelnemer telt eigen afstand
                if (reg.distance && distMap[reg.distance] !== undefined) {
                    distMap[reg.distance]++;
                }
            } else if (reg.role === "vrijwilliger") {
                roleMap["vrijwilliger"]++;
            }

            // Groepsleden afstanden ook meewegen in distMap
            if (reg.role === "begeleider" && reg.groupMembers) {
                for (const m of reg.groupMembers) {
                    if (m.distance && distMap[m.distance] !== undefined) {
                        distMap[m.distance]++;
                    }
                }
            }

            // Revenue Calculation (Kept as secondary metric)
            if (reg.status === "paid") {
                const price = reg.distance ? (PRICE_MAP[reg.distance] || DEFAULT_PRICE) : 0;
                revenue += price;
            }

            // New Today
            if (reg.createdAt >= startOfToday) {
                newTodayCount++;
            }

            // Logistics counters
            if (reg.wheelchairUser) wheelchairCount++;
            if (reg.shuttleBus === "pendelbus") shuttleBusCount++;
            if (reg.livesInFacility) facilityCount++;
            if (reg.participantType && participantTypeMap[reg.participantType] !== undefined) {
                participantTypeMap[reg.participantType]++;
            }
        });

        // Sort Domains by popularity
        const topDomains = Object.entries(domainMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4) // Top 4
            .map(([domain, count]) => ({ domain, count }));

        // Recent 5
        const recent = [...registrations]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        // Totaal werkelijke deelnemers:
        // deelnemer = +1, begeleider = +groepsleden.length, vrijwilliger = +0
        const totalParticipants = registrations.reduce((sum, reg) => {
            if (reg.role === "deelnemer") return sum + 1;
            if (reg.role === "begeleider") return sum + (reg.groupMembers?.length ?? 0);
            return sum; // vrijwilliger telt niet mee
        }, 0);

        return {
            totalRevenue: revenue,
            totalParticipants,
            uniqueReach: uniqueEmails.size,
            newToday: newTodayCount,
            participantsByDistance: distMap,
            participantsByRole: roleMap,
            participantsByUserType: userTypeMap,
            topDomains,
            recentRegistrations: recent,
            logistics: {
                wheelchairCount,
                shuttleBusCount,
                facilityCount,
                participantTypeBreakdown: participantTypeMap,
            }
        };
    }, [registrations]);
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR"
    }).format(amount);
};
