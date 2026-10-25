/** All 75 Arkansas counties. */
export const COUNTIES = ['Arkansas', 'Ashley', 'Baxter', 'Benton', 'Boone', 'Bradley', 'Calhoun', 'Carroll', 'Chicot', 'Clark', 'Clay', 'Cleburne', 'Cleveland', 'Columbia', 'Conway', 'Craighead', 'Crawford', 'Crittenden', 'Cross', 'Dallas', 'Desha', 'Drew', 'Faulkner', 'Franklin', 'Fulton', 'Garland', 'Grant', 'Greene', 'Hempstead', 'Hot Spring', 'Howard', 'Independence', 'Izard', 'Jackson', 'Jefferson', 'Johnson', 'Lafayette', 'Lawrence', 'Lee', 'Lincoln', 'Little River', 'Logan', 'Lonoke', 'Madison', 'Marion', 'Miller', 'Mississippi', 'Monroe', 'Montgomery', 'Nevada', 'Newton', 'Ouachita', 'Perry', 'Phillips', 'Pike', 'Poinsett', 'Polk', 'Pope', 'Prairie', 'Pulaski', 'Randolph', 'St. Francis', 'Saline', 'Scott', 'Searcy', 'Sebastian', 'Sevier', 'Sharp', 'Stone', 'Union', 'Van Buren', 'Washington', 'White', 'Woodruff', 'Yell']

/**
 * A small ZIP → county table for common Arkansas ZIP codes (county seats and larger towns).
 * Unknown ZIPs fall back to asking for the county, never to a guess.
 */
export const ZIP_COUNTY: Record<string, string> = {
  '71601': 'Jefferson', '71602': 'Jefferson', '71603': 'Jefferson', '71635': 'Ashley', '71655': 'Drew', '71671': 'Bradley', '71701': 'Ouachita', '71730': 'Union', '71753': 'Columbia', '71801': 'Hempstead', '71852': 'Howard', '71854': 'Miller', '71832': 'Sevier', '71901': 'Garland', '71913': 'Garland', '71923': 'Clark', '71953': 'Polk',
  '72015': 'Saline', '72019': 'Saline', '72022': 'Saline', '72023': 'Lonoke', '72032': 'Faulkner', '72034': 'Faulkner', '72076': 'Pulaski', '72086': 'Lonoke', '72110': 'Conway', '72113': 'Pulaski', '72114': 'Pulaski', '72116': 'Pulaski', '72117': 'Pulaski', '72118': 'Pulaski', '72120': 'Pulaski', '72143': 'White', '72160': 'Arkansas',
  '72201': 'Pulaski', '72202': 'Pulaski', '72204': 'Pulaski', '72205': 'Pulaski', '72206': 'Pulaski', '72207': 'Pulaski', '72209': 'Pulaski', '72210': 'Pulaski', '72211': 'Pulaski', '72212': 'Pulaski', '72223': 'Pulaski', '72227': 'Pulaski',
  '72301': 'Crittenden', '72335': 'St. Francis', '72315': 'Mississippi', '72342': 'Phillips', '72360': 'Lee', '72364': 'Crittenden', '72396': 'Cross',
  '72401': 'Craighead', '72404': 'Craighead', '72450': 'Greene', '72455': 'Randolph', '72476': 'Lawrence', '72501': 'Independence', '72543': 'Cleburne', '72560': 'Stone', '72653': 'Baxter', '72601': 'Boone', '72112': 'Jackson',
  '72701': 'Washington', '72703': 'Washington', '72704': 'Washington', '72762': 'Washington', '72764': 'Washington', '72712': 'Benton', '72756': 'Benton', '72758': 'Benton', '72745': 'Benton', '72616': 'Carroll', '72740': 'Madison',
  '72801': 'Pope', '72802': 'Pope', '72830': 'Johnson', '72834': 'Yell', '72855': 'Logan', '72901': 'Sebastian', '72903': 'Sebastian', '72904': 'Sebastian', '72908': 'Sebastian', '72956': 'Crawford', '72921': 'Crawford', '72949': 'Franklin', '72958': 'Scott',
}

export function resolveCounty(input: string): { county?: string; zipUnknown?: boolean } {
  const q = input.trim()
  if (/^\d{5}$/.test(q)) {
    const county = ZIP_COUNTY[q]
    return county ? { county } : { zipUnknown: true }
  }
  const norm = q.toLowerCase().replace(/\s*county$/, '').replace(/^saint /, 'st. ').replace(/^st /, 'st. ')
  const county = COUNTIES.find((c) => c.toLowerCase() === norm) ?? COUNTIES.find((c) => c.toLowerCase().startsWith(norm) && norm.length >= 3)
  return { county }
}
