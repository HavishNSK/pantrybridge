import type { Resource } from '../types'

/**
 * Arkansas food-assistance directory.
 * Every entry was checked against the listed source on the `lastVerified` date.
 * Hours and phone numbers change: the UI tells people to confirm before travelling.
 */
const V = '2026-10-24'

export const AFB_COUNTIES = ['Arkansas', 'Ashley', 'Bradley', 'Calhoun', 'Chicot', 'Clark', 'Cleburne', 'Cleveland', 'Conway', 'Dallas', 'Desha', 'Drew', 'Faulkner', 'Garland', 'Grant', 'Hot Spring', 'Independence', 'Jefferson', 'Lee', 'Lincoln', 'Lonoke', 'Monroe', 'Montgomery', 'Ouachita', 'Perry', 'Phillips', 'Pope', 'Prairie', 'Pulaski', 'Saline', 'Union', 'Van Buren', 'White']
export const FBNEA_COUNTIES = ['Baxter', 'Boone', 'Clay', 'Craighead', 'Cross', 'Fulton', 'Greene', 'Izard', 'Jackson', 'Lawrence', 'Marion', 'Mississippi', 'Newton', 'Poinsett', 'Randolph', 'St. Francis', 'Searcy', 'Sharp', 'Stone', 'Woodruff']
export const FBNCA_COUNTIES = ['Baxter', 'Boone', 'Fulton', 'Izard', 'Marion', 'Newton', 'Searcy', 'Sharp', 'Stone']
export const NWA_COUNTIES = ['Benton', 'Carroll', 'Madison', 'Washington']
export const RV_COUNTIES = ['Crawford', 'Franklin', 'Johnson', 'Logan', 'Polk', 'Scott', 'Sebastian', 'Yell']
export const HARVEST_COUNTIES = ['Columbia', 'Hempstead', 'Howard', 'Lafayette', 'Little River', 'Miller', 'Nevada', 'Pike', 'Sevier']
export const MIDSOUTH_COUNTIES = ['Crittenden']

export const RESOURCES: Resource[] = [
  // Statewide first-call options
  {
    id: 'ar-211', name: 'Arkansas 211', type: 'hotline', official: true, counties: [],
    description: 'Free, confidential help finding food pantries, meals, and other local services. Dial 211 or text your ZIP code to 898-211. Available 24/7.',
    url: 'https://www.arkansas211.org', phone: '211', source: 'arkansas211.org; Arkansas.gov services portal', lastVerified: V,
  },
  {
    id: 'ar-hunger-alliance-map', name: 'Arkansas Hunger Relief Alliance food finder', type: 'pantry-finder', official: false, counties: [],
    description: 'Statewide map of 500+ member pantries, soup kitchens, and mobile pantries.',
    url: 'https://arhungeralliance.org/find-food', source: 'arhungeralliance.org/find-food', lastVerified: V,
  },
  {
    id: 'usda-hunger-hotline', name: 'USDA National Hunger Hotline', type: 'hotline', official: true, counties: [],
    description: 'Speak with someone who can find meal sites, food banks, and programs near you. Mon–Fri, 8 a.m.–8 p.m. ET. Operated by Hunger Free America for USDA.',
    url: 'https://www.fns.usda.gov/national-hunger-hotline', phone: '1-866-348-6479', source: 'fns.usda.gov/national-hunger-hotline', lastVerified: V,
  },

  // Benefits programs (official information lives with the agency)
  {
    id: 'ar-snap', name: 'SNAP: apply through Access Arkansas', type: 'snap', official: true, counties: [],
    description: 'Arkansas DHS takes SNAP applications online, by phone, or at a county DHS office. DHS decides eligibility; PantryBridge does not.',
    url: 'https://access.arkansas.gov', phone: '1-855-372-1084', source: 'humanservices.arkansas.gov/apply-for-services', lastVerified: V,
  },
  {
    id: 'ar-wic', name: 'WIC: Arkansas Department of Health', type: 'wic', official: true, counties: [],
    description: 'Healthy food, nutrition support, and breastfeeding help for pregnant people, new parents, infants, and children under 5. Call to make an appointment at your local health unit.',
    url: 'https://healthy.arkansas.gov/programs-services/community-family-child-health/wic-women-infants-children/', phone: '1-800-235-0002', source: 'healthy.arkansas.gov (WIC page)', lastVerified: V,
  },
  {
    id: 'ar-summer-ebt', name: 'Summer EBT (SUN Bucks) for school-age kids', type: 'kids', official: true, counties: [],
    description: 'Grocery benefits for eligible children during summer break. Many families are enrolled automatically; others can apply through Arkansas DHS.',
    url: 'https://humanservices.arkansas.gov/news/arkansas-continues-summer-ebt-program-to-combat-childhood-hunger-2/', source: 'humanservices.arkansas.gov (May 2026 announcement)', lastVerified: V,
  },
  {
    id: 'ar-summer-meals', name: 'Free summer meals for kids & teens', type: 'kids', official: false, counties: [],
    description: 'No Kid Hungry Arkansas lists free summer meal sites for anyone 18 and under. No application needed.',
    url: 'https://arhungeralliance.org/programs/no-kid-hungry/summer-meals/', source: 'arhungeralliance.org', lastVerified: V,
  },
  {
    id: 'usda-tefap', name: 'The Emergency Food Assistance Program (TEFAP)', type: 'meals', official: true, counties: [],
    description: 'USDA foods distributed through local food banks and pantries. Ask your regional food bank which pantries take part.',
    url: 'https://www.fns.usda.gov/tefap/emergency-food-assistance-program', source: 'fns.usda.gov', lastVerified: V,
  },

  // Regional food banks (each links to its own pantry finder)
  {
    id: 'arkansas-foodbank', name: 'Arkansas Foodbank', type: 'food-bank', official: false, counties: AFB_COUNTIES,
    description: 'Central, eastern, and southern Arkansas. Their Find Food page lists partner pantries and mobile distributions.',
    url: 'https://arkansasfoodbank.org/find-food/', phone: '501-565-8121', source: 'arkansasfoodbank.org; Feeding America directory', lastVerified: V,
  },
  {
    id: 'fbnea', name: 'Food Bank of Northeast Arkansas', type: 'food-bank', official: false, counties: FBNEA_COUNTIES,
    description: 'Northeast Arkansas, based in Jonesboro. Call for partner pantries in your county.',
    url: 'https://foodbankofnea.org/', phone: '870-932-3663', source: 'Feeding America directory; WhyHunger listing', lastVerified: V,
  },
  {
    id: 'fbnca', name: 'Food Bank of North Central Arkansas', type: 'food-bank', official: false, counties: FBNCA_COUNTIES,
    description: 'North central Arkansas, based in Mountain Home. Their Find Food page lists local pantries.',
    url: 'https://foodbanknca.org/find-food', phone: '870-499-7565', source: 'foodbanknca.org', lastVerified: V,
  },
  {
    id: 'nwafb', name: 'Northwest Arkansas Food Bank', type: 'food-bank', official: false, counties: NWA_COUNTIES,
    description: 'Benton, Carroll, Madison, and Washington counties. Use "Find an Agency" to see nearby pantries.',
    url: 'https://www.nwafoodbank.org/find-food', phone: '479-872-8774', source: 'nwafoodbank.org', lastVerified: V,
  },
  {
    id: 'rvrfb', name: 'River Valley Regional Food Bank', type: 'food-bank', official: false, counties: RV_COUNTIES,
    description: 'West-central Arkansas, based in Fort Smith. See their locations and areas served.',
    url: 'https://www.rvfoodbanks.org/locations-1', phone: '1-800-568-5240', source: 'rvfoodbanks.org; Feeding America directory', lastVerified: V,
  },
  {
    id: 'harvest', name: 'Harvest Regional Food Bank', type: 'food-bank', official: false, counties: HARVEST_COUNTIES,
    description: 'Southwest Arkansas, based in Texarkana. Call for partner pantries. (We do not link the old harvesttexarkana.org domain, which no longer belongs to the food bank.)',
    url: 'https://www.feedingamerica.org/find-your-local-foodbank/harvest-regional-food-bank-inc', phone: '870-774-1398', source: 'Feeding America directory; WhyHunger listing', lastVerified: V,
  },
  {
    id: 'midsouth', name: 'Mid-South Food Bank', type: 'food-bank', official: false, counties: MIDSOUTH_COUNTIES,
    description: 'Serves Crittenden County through partner pantries (like Good Neighbor in West Memphis) and mobile distributions.',
    url: 'https://www.midsouthfoodbank.org/', source: 'midsouthfoodbank.org; Feeding America directory', lastVerified: V,
  },
]

export const RESOURCE_TYPE_LABEL: Record<Resource['type'], string> = {
  'food-bank': 'Food bank',
  'pantry-finder': 'Pantry finder',
  snap: 'SNAP',
  wic: 'WIC',
  kids: 'Kids & school',
  hotline: 'Helpline',
  meals: 'Community food',
  seniors: 'Seniors',
}
