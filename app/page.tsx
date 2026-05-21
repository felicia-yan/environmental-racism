"use client";

import { useState, useRef } from "react";
import {
  IntroSection,
  ChapterHeader,
  NarrativeSection,
  NarrativeText,
  NarrativeHighlight,
  RedliningSimulation,
  SacrificeZonesSimulation,
  HealthOutcomesSimulation,
} from "@/components/scrollytelling";

type Section = "intro" | "chapter1" | "chapter2" | "chapter3" | "conclusion";

export default function EnvironmentalRacismPage() {
  const [currentSection, setCurrentSection] = useState<Section>("intro");
  const [started, setStarted] = useState(false);

  const introRevealRef = useRef<HTMLDivElement>(null);
  const chapter1Ref = useRef<HTMLDivElement>(null);
  const chapter2Ref = useRef<HTMLDivElement>(null);
  const chapter3Ref = useRef<HTMLDivElement>(null);
  const conclusionRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    setStarted(true);
    introRevealRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToChapter = (chapter: Section) => {
    setCurrentSection(chapter);
    switch (chapter) {
      case "chapter1":
        chapter1Ref.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "chapter2":
        chapter2Ref.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "chapter3":
        chapter3Ref.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "conclusion":
        conclusionRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
    }
  };

  return (
    <main className="scroll-smooth">
      {/* Intro Section */}
      <IntroSection onStart={handleStart} />

      {/* Intro Reveal - Highway appears */}
      <div
        ref={introRevealRef}
        className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      >
        <NarrativeSection className="max-w-2xl">
          <NarrativeText>
            When a city decides to build a highway, they also decide who has to
            experience all the noise, exhaust, and pollution that comes out of
            it.
          </NarrativeText>
          <NarrativeText>
            But how do cities decide who has to deal with the mess? Is that
            choice always fair? Many people argue that those decisions often
            aren&apos;t fair and impact certain groups far more than others.
          </NarrativeText>
          <NarrativeHighlight>
            How can that be? To see why, let&apos;s take a step back and see how
            a historical policy shaped where people in the US live.
          </NarrativeHighlight>
        </NarrativeSection>
      </div>

      {/* Chapter 1: Redlining */}
      <div ref={chapter1Ref}>
        <ChapterHeader chapterNumber={1} title="Redlining" totalChapters={3} />

        <NarrativeSection>
          <NarrativeHighlight>
            Mortgages, equity, deeds... To understand what any of these terms
            have to do with highways, let&apos;s first step into the shoes of a
            lender in 1965, with lots of cash to spare.
          </NarrativeHighlight>
          <NarrativeText>
            Newcomers have arrived in town, and they&apos;re looking for homes!
          </NarrativeText>
          <NarrativeText>
            Since the vast majority of people can&apos;t buy their homes
            outright, they&apos;re coming to you, a lender, for a loan they can
            pay back slowly over time. Your job is to decide who gets help
            buying a home, and who doesn&apos;t.
          </NarrativeText>
          <NarrativeText>
            Luckily for you, your company has already mapped the risk score for
            every neighborhood in town, which indicates how risky it will be for
            you to lend to someone who wants to buy a house there. How
            convenient!
          </NarrativeText>
          <NarrativeHighlight>
            Look, people are lining up now! Using the risk scores, review their
            applications and decide if you&apos;ll offer them a mortgage to buy
            the house they want. A high risk score means there&apos;s a higher
            chance that you&apos;ll lose money by lending in that area, so
            choose wisely.
          </NarrativeHighlight>
        </NarrativeSection>

        {/* Redlining Simulation */}
        <RedliningSimulation
          onComplete={(results) => {
            console.log("Redlining simulation complete:", results);
          }}
        />

        <NarrativeSection>
          <NarrativeHighlight>
            The risk scores seem awfully handy, but did you stop to think about
            what factors are used to calculate them?
          </NarrativeHighlight>
          <NarrativeText>
            What do you think actually predicts whether someone will be a risky
            borrower? Try to recreate the original risk score.
          </NarrativeText>

          {/* Placeholder for risk factor manipulation */}
          <div className="w-full h-48 bg-muted rounded-lg my-8 flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-muted-foreground">
              [Risk factor manipulation simulation placeholder]
            </span>
          </div>

          <NarrativeText>Were the risk scores calculated fairly?</NarrativeText>
        </NarrativeSection>

        <NarrativeSection>
          <NarrativeHighlight>
            From the 1930s-60s, lenders did not assess risk based on an
            individual&apos;s personal financial history. Instead, each
            neighborhood was broadly labeled based on the racial make-up of its
            residents and property values.
          </NarrativeHighlight>
          <NarrativeText>
            More specifically, neighborhoods with any number of Black residents
            were labeled &quot;hazardous&quot; (D rating) to make loans to,
            while affluent white neighborhoods were labeled &quot;best&quot; (A
            rating).
          </NarrativeText>
          <NarrativeText>
            And it wasn&apos;t just one bad lender. With institutionalized
            support from federal regulators, banks and other lending
            institutions all around the country used similar methods to assess
            risk in order to deny access to loans for people who were part of a
            minority group or wanted to live in neighborhoods where minorities
            lived, keeping communities segregated and systematically withholding
            investment from low-income, immigrant, and predominantly Black and
            brown neighborhoods.
          </NarrativeText>
          <NarrativeHighlight>
            This is a practice known as <strong>redlining</strong>, and this
            kind of discriminatory lending is now very illegal.
          </NarrativeHighlight>
          <NarrativeText>
            Look at your town again, and now see the result of the decisions
            made based on those discriminatory risk scores.
          </NarrativeText>
        </NarrativeSection>

        <NarrativeSection>
          <NarrativeHighlight>
            People who were denied a mortgage loan found other ways to buy a
            home.
          </NarrativeHighlight>
          <NarrativeText>
            One of the most common options was a{" "}
            <strong>contract for deed</strong>. In this often shady arrangement,
            the lender only handed over the title to the house at the very last
            payment, unlike a mortgage, where the borrower owns the house from
            the start. In a contract for deed, if a borrower misses a single
            payment, they can lose their entire house and be evicted.
          </NarrativeText>
          <NarrativeText>
            At first glance, a mortgage and a contract for deed both seem like
            pretty similar ways to buy a home. Adjust the factors below to see
            how things change for a family based on how they are paying for
            their house.
          </NarrativeText>

          {/* Placeholder for equity comparison visualization */}
          <div className="w-full h-64 bg-muted rounded-lg my-8 flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-muted-foreground">
              [Mortgage vs Contract for Deed equity comparison placeholder]
            </span>
          </div>

          <NarrativeText>
            For most households, homes are the single biggest investment
            they&apos;ll ever make. As a result, over time, disparities in
            access to traditional mortgages can have major compounding effects.
          </NarrativeText>
          <NarrativeHighlight>
            Unequal opportunities to accumulate wealth is one of these effects,
            but this is far from the only effect of neighborhood disinvestment.
          </NarrativeHighlight>
        </NarrativeSection>
      </div>

      {/* Chapter 2: Sacrifice Zones */}
      <div ref={chapter2Ref}>
        <ChapterHeader
          chapterNumber={2}
          title="Sacrifice Zones"
          totalChapters={3}
        />

        <NarrativeSection>
          <NarrativeHighlight>
            Major infrastructure projects like big industrial facilities and
            highways are all around us, but they aren&apos;t placed randomly.
            People are involved in carefully planning where they go.
          </NarrativeHighlight>
          <NarrativeText>
            Your town is bustling with all these new people, and traffic is
            getting seriously backed up. The city wants a highway to deal with
            this, which would also be wonderful for the economy!
          </NarrativeText>
          <NarrativeText>
            You&apos;ve been promoted from lender to city planner, and now you
            get to make that siting decision. Pick where you want the highway to
            go, then send your proposed map off to the citizens for a vote. If
            your proposal doesn&apos;t pass, try again! The land needs to be
            cheap and there needs to be enough of it.
          </NarrativeText>
        </NarrativeSection>

        {/* Sacrifice Zones Simulation */}
        <SacrificeZonesSimulation
          onComplete={() => {
            console.log("Sacrifice zones simulation complete");
          }}
        />

        <NarrativeSection>
          <NarrativeHighlight>
            In the mid-1960s, construction on the Durham Freeway began.
          </NarrativeHighlight>
          <NarrativeText>
            In order to choose where it would be built, a federal program
            targeted &quot;blighted&quot; or &quot;slum&quot; neighborhoods and
            promised them that they&apos;d help build back even better.
          </NarrativeText>
          <NarrativeText>
            They chose <strong>Hayti District</strong>, which was once a
            thriving community in downtown Durham known as Black Wall Street,
            originally founded by freedmen.
          </NarrativeText>
          <NarrativeText>
            As the area declined into disrepair after its golden era, believing
            in the promise of this program called urban renewal, many residents
            voted yes to build the freeway. At the time, over 90% of the
            families in the area were Black. Most of the Hayti neighborhood was
            then razed and over 500 businesses were displaced to make way for
            the freeway.
          </NarrativeText>
          <NarrativeText>
            In the end, the promised redevelopment never came.
          </NarrativeText>
        </NarrativeSection>

        <NarrativeSection>
          <NarrativeHighlight>
            People who have political and economic power can resist unwanted
            projects. This is the principle of NIMBY, or Not In My Backyard.
          </NarrativeHighlight>
          <NarrativeText>
            NIMBY is a movement of residents opposing undesirable infrastructure
            developments being sited next to their neighborhoods. But not every
            community has the same ability to say no.
          </NarrativeText>
          <NarrativeText>
            Lower-income neighborhoods have less power to oppose or negotiate
            with huge corporations and powerful governments buying up cheap land
            to build on. Other times, residents hesitate to resist projects
            because of a greater need for the jobs and tax revenue that come out
            of them. Even if they want to leave as their neighborhood becomes
            more and more polluted, residents lack the financial resources to
            easily pick up and move to a safer and cleaner area.
          </NarrativeText>
          <NarrativeHighlight>
            Over time, these areas turn into <strong>sacrifice zones</strong>,
            or places where certain communities are expected to bear
            disproportionate environmental harms for the benefit of others.
          </NarrativeHighlight>
          <NarrativeText>
            See the different types of pollution that come out of different
            industrial sites.
          </NarrativeText>

          {/* Placeholder for pollution types visualization */}
          <div className="w-full h-48 bg-muted rounded-lg my-8 flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-muted-foreground">
              [Pollution types visualization placeholder]
            </span>
          </div>

          <NarrativeText>
            As we&apos;ve already seen, not all neighborhoods are made equal. As
            a result, these environmental hazards, from smog to contaminated
            soil to polluted water, affect certain communities more than others
            based on where they live.
          </NarrativeText>
        </NarrativeSection>
      </div>

      {/* Chapter 3: Health Outcomes */}
      <div ref={chapter3Ref}>
        <ChapterHeader
          chapterNumber={3}
          title="Health Outcomes"
          totalChapters={3}
        />

        <NarrativeSection>
          <NarrativeHighlight>
            For people who wake up every day with a highway at their doorstep,
            cars driving by are more than just an eyesore; it can also have a
            lasting impact on their health.
          </NarrativeHighlight>
          <NarrativeText>
            As a city planner, you already saw all kinds of pollution that can
            come from a highway, but what does this mean in the long term? Run
            simulations to see how the highway affects the health of your
            neighbors over time.
          </NarrativeText>
        </NarrativeSection>

        {/* Health Outcomes Simulation */}
        <HealthOutcomesSimulation
          onComplete={() => {
            console.log("Health outcomes simulation complete");
          }}
        />

        <NarrativeSection>
          <NarrativeHighlight>
            Woah, that was a lot of information. For the big finale, let&apos;s
            put everything you&apos;ve learned together.
          </NarrativeHighlight>
          <NarrativeText>
            It seems like everything is connected somehow...
          </NarrativeText>

          {/* Placeholder for connection diagram builder */}
          <div className="w-full h-64 bg-muted rounded-lg my-8 flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-muted-foreground">
              [Connection diagram builder - work backwards from health outcomes
              placeholder]
            </span>
          </div>
        </NarrativeSection>
      </div>

      {/* Conclusion */}
      <div ref={conclusionRef} className="min-h-screen bg-background">
        <NarrativeSection className="py-24">
          <NarrativeHighlight>Everything is connected.</NarrativeHighlight>
          <NarrativeText>
            <strong>
              Neighborhoods are denied access to opportunities by redlining.
            </strong>
          </NarrativeText>
          <NarrativeText>
            More big polluting sites get put in these neighborhoods because they
            lack the means to fight back.
          </NarrativeText>
          <NarrativeText>
            <strong>
              Those same neighborhoods face disproportionate exposure to
              environmental hazards.
            </strong>
          </NarrativeText>
          <NarrativeText>
            Heightened exposure over a lifetime increases incidence of serious
            health conditions like asthma and cancer.
          </NarrativeText>
          <NarrativeHighlight>
            This is <strong>environmental racism</strong>, and it's still
            happening all around us.
          </NarrativeHighlight>
          <NarrativeHighlight>
            In this new age of industrial facilties from data centers to lithium
            refineries, consider: where are they being built, and why?
          </NarrativeHighlight>
        </NarrativeSection>

        {/* References */}
        <section className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold mb-4">References</h2>
          <p className="text-sm text-foreground/70 mb-8">
            This explorable explanation covered a wide range of topics across
            history, economics, environmental science, and public health. There
            are a lot of concepts that have been simplified considerably here
            and are much more complex in real life. I&apos;ve organized my
            sources below, including some links to other cool related
            interactive visualizations if you&apos;d like to learn more:
          </p>

          <div className="space-y-8 text-xs">
            <div>
              <h3 className="font-bold text-base mb-3">
                US History (on redlining, segregation, racial covenants)
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>
                  <a
                    href="https://dsl.richmond.edu/panorama/redlining/"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mapping Inequality: Redlining in New Deal America
                  </a>
                </li>
                <li>
                  <a
                    href="https://daily.jstor.org/the-uneven-costs-of-cross-country-connectivity/"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    JSTOR Daily: The Uneven Costs of Cross-Country Connectivity
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.npr.org/2021/04/07/984784455/a-brief-history-of-how-racism-shaped-interstate-highways"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NPR: A Brief History of How Racism Shaped Interstate
                    Highways
                  </a>
                </li>
                <li>
                  <a
                    href="https://heinonline.org/HOL/P?h=hein.journals/vanlr73&i=1298"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vanderbilt Law Review
                  </a>
                </li>
                <li>
                  <a
                    href="https://storymaps.arcgis.com/stories/0f58d49c566b486482b3e64e9e5f7ac9"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ArcGIS StoryMaps
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3">
                NC History (on the Hayti District, urban renewal in Durham)
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>
                  <a
                    href="https://plantationstopollution.selc.org/hayti-nc/"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Plantations to Pollution: Hayti, NC
                  </a>
                </li>
                <li>
                  <span>
                    Vann, A. D., & Jones, B. W. (1999). Durham&apos;s Hayti.
                    Arcadia Publishing.
                  </span>
                </li>
                <li>
                  <span>
                    Williams, O.R. (2006). Memories of Hayti: African American
                    Community in Durham, North Carolina, 1890–1970. In: The
                    Black Urban Community. Palgrave Macmillan.
                  </span>
                </li>
                <li>
                  <a
                    href="https://www.digitalnc.org/primary-source-sets/urban-development-and-renewal/"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Digital NC: Urban Development and Renewal
                  </a>
                </li>
                <li>
                  <a
                    href="https://healthydurham.org/wp-content/uploads/Durham-Health-and-History-Report-Final-October-2024.pdf"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Durham Health and History Report (2024)
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3">
                Economics (on mortgages, contracts for deeds, home equity)
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>
                  <a
                    href="https://home.treasury.gov/news/featured-stories/racial-differences-in-economic-security-housing"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    US Treasury: Racial Differences in Economic Security -
                    Housing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-3">
                Environmental Justice (on environmental racism, SDOH)
              </h3>
              <ul className="space-y-2 text-foreground/80">
                <li>
                  <a
                    href="https://www.propublica.org/article/toxmap-poison-in-the-air"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ProPublica: Poison in the Air
                  </a>
                </li>
                <li>
                  <a
                    href="https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2813184"
                    className="text-secondary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    JAMA Network Open
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-border">
          <p className="text-foreground/80 mb-2">
            Created by Felicia Yan for{" "}
            <strong>
              EDUC 432: Designing Explorable Explanations for Learning
            </strong>{" "}
            in Spring 2026.
          </p>
          {/* <p className="text-foreground/60">Thanks for a wonderful quarter!</p> */}
          {/* <p className="text-foreground/80 mt-4 font-medium">by Felicia Yan</p> */}
        </footer>
      </div>
    </main>
  );
}
