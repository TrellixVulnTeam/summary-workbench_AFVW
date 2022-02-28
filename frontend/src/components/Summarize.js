import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useAsyncFn } from "react-use";

import { feedbackRequest, summarizeRequest } from "../api";
import { SettingsContext } from "../contexts/SettingsContext";
import { SummarizersContext } from "../contexts/SummarizersContext";
import { useMarkups, usePairwiseMarkups } from "../hooks/markup";
import { Settings } from "./Settings";
import { Badge } from "./utils/Badge";
import { Button, LoadingButton } from "./utils/Button";
import { Card, CardContent, CardHead } from "./utils/Card";
import { Textarea } from "./utils/Form";
import { Bars, EyeClosed, EyeOpen, ThumbsDown, ThumbsUp } from "./utils/Icons";
import { SpaceGap } from "./utils/Layout";
import { CenterLoading } from "./utils/Loading";
import { Markup, useMarkupScroll } from "./utils/Markup";
import { Pill, TabContent, TabHead, TabPanel, Tabs } from "./utils/Tabs";
import { HeadingBig, HeadingSemiBig, Hint } from "./utils/Text";
import { Tooltip } from "./utils/Tooltip";

const Feedback = ({ summary }) => {
  const { name, summaryText, originalText, url } = summary;
  const [state, submit] = useAsyncFn(
    (feedback) => feedbackRequest(name, summaryText, originalText, url, feedback).then(() => true),
    [name, summaryText, originalText, url]
  );

  if (state.value) return <HeadingSemiBig>Thanks for the Feedback!</HeadingSemiBig>;
  return (
    <div className="flex flex-col items-end">
      <div className="flex gap-4">
        <HeadingSemiBig>Good Summary?</HeadingSemiBig>
        <div className="flex gap-2">
          <ThumbsUp className="w-5 h-5" onClick={() => submit("good")} />
          <ThumbsDown className="w-5 h-5" onClick={() => submit("bad")} />
        </div>
      </div>
      {state.error && (
        <Hint type="danger" small>
          An Error occured
        </Hint>
      )}
    </div>
  );
};

const getChosenModels = (models) =>
  Object.entries(models)
    .filter((e) => e[1])
    .map((e) => e[0]);

const sampleText = `Alan Mathison Turing was an English mathematician, computer scientist, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general-purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. Despite these accomplishments, he was never fully recognised in his home country, if only because much of his work was covered by the Official Secrets Act.
During the Second World War, Turing worked for the Government Code and Cypher School (GC&CS) at Bletchley Park, Britain's codebreaking centre that produced Ultra intelligence. For a time he led Hut 8, the section that was responsible for German naval cryptanalysis. Here, he devised a number of techniques for speeding the breaking of German ciphers, including improvements to the pre-war Polish bombe method, an electromechanical machine that could find settings for the Enigma machine.
Turing played a crucial role in cracking intercepted coded messages that enabled the Allies to defeat the Nazis in many crucial engagements, including the Battle of the Atlantic. Due to the problems of counterfactual history, it is hard to estimate the precise effect Ultra intelligence had on the war, but Professor Jack Copeland has estimated that this work shortened the war in Europe by more than two years and saved over 14 million lives.
After the war, Turing worked at the National Physical Laboratory, where he designed the Automatic Computing Engine. The Automatic Computing Engine was one of the first designs for a stored-program computer. In 1948, Turing joined Max Newman's Computing Machine Laboratory, at the Victoria University of Manchester, where he helped develop the Manchester computers and became interested in mathematical biology. He wrote a paper on the chemical basis of morphogenesis and predicted oscillating chemical reactions such as the Belousov–Zhabotinsky reaction, first observed in the 1960s.
Turing was prosecuted in 1952 for homosexual acts; the Labouchere Amendment of 1885 had mandated that "gross indecency" was a criminal offence in the UK. He accepted chemical castration treatment, with DES, as an alternative to prison. Turing died in 1954, 16 days before his 42nd birthday, from cyanide poisoning. An inquest determined his death as a suicide, but it has been noted that the known evidence is also consistent with accidental poisoning.
In 2009, following an Internet campaign, British Prime Minister Gordon Brown made an official public apology on behalf of the British government for "the appalling way he was treated". Queen Elizabeth II granted Turing a posthumous pardon in 2013. The "Alan Turing law" is now an informal term for a 2017 law in the United Kingdom that retroactively pardoned men cautioned or convicted under historical legislation that outlawed homosexual acts.`;

const InputDocument = ({ summarize, state }) => {
  const [documentText, setDocumentText] = useState("");
  const { summarizers, settings, toggleSetting } = useContext(SummarizersContext);
  const { summaryLength } = useContext(SettingsContext);

  const chosenModels = getChosenModels(settings);

  const insertSampleText = () => {
    setDocumentText(sampleText);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="grow flex flex-col min-w-[400px] min-h-[400px]">
        <Card full>
          <CardHead>
            <div className="w-full flex justify-between items-center">
              <HeadingSemiBig>Document</HeadingSemiBig>
              <Button variant="primary" onClick={insertSampleText}>
                Sample Text
              </Button>
            </div>
          </CardHead>
          <Textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.currentTarget.value)}
            placeholder="Enter a URL or the text to be summarized."
          />
        </Card>
      </div>

      <div className="min-w-[600px]">
        <div>
          <Card full>
            <CardHead>
              <HeadingSemiBig>Models</HeadingSemiBig>
            </CardHead>
            <CardContent>
              <Settings
                models={summarizers}
                settings={settings}
                toggleSetting={toggleSetting}
                type="Summarizers"
              />
              <div className="flex items-center gap-5">
                {state.loading ? (
                  <LoadingButton />
                ) : (
                  <Button
                    disabled={!documentText || !chosenModels.length}
                    onClick={() => summarize(documentText, chosenModels, summaryLength)}
                  >
                    Summarize
                  </Button>
                )}
                <div className="flex flex-col">
                  {!documentText && (
                    <Hint type="info" small>
                      Input text to summarize
                    </Hint>
                  )}
                  {!chosenModels.length && (
                    <Hint type="warning" small>
                      Choose at least one metric
                    </Hint>
                  )}
                  {!state.loading && state.error && (
                    <Hint type="danger" small>
                      {state.error.message}
                    </Hint>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const computeNumWords = (text) => [...text.matchAll(/[a-zA-Z]+/g)].length;

const generateStatistics = (text, summaryMarkup) => {
  const numWords = computeNumWords(text);
  let numMarkupedWords = numWords;
  summaryMarkup.forEach((subtext) => {
    if (typeof subtext === "string") numMarkupedWords -= computeNumWords(subtext);
  });
  return {
    numWords,
    percentOverlap: numWords ? numMarkupedWords / numWords : 0,
  };
};

const Summary = ({ markup, summary, markupState, scrollState, showMarkup }) => {
  const { summaryText } = summary;
  const { numWords, percentOverlap } = useMemo(
    () => generateStatistics(summaryText, markup[1]),
    [markup, summaryText]
  );

  return (
    <div>
      <div className="flex gap-2 pb-2 -mt-2">
        <Badge>{`${numWords} words`}</Badge>
        <Badge>{`${(percentOverlap * 100).toFixed(0)}% overlap`}</Badge>
      </div>
      <Markup
        markups={markup[1]}
        markupState={markupState}
        scrollState={scrollState}
        showMarkup={showMarkup}
      />
      <div className="pt-4 flex justify-end">
        <Feedback summary={summary} />
      </div>
    </div>
  );
};

const SummaryTabView = ({ title, showOverlap, summaries, markups, documentLength }) => {
  const { summarizers } = useContext(SummarizersContext);
  const markupState = useState(null);
  const scrollState = useMarkupScroll();
  const resetScroll = scrollState[2];
  const [summaryIndex, setSummaryIndex] = useReducer((_, index) => {
    resetScroll();
    return index;
  }, 0);

  if (!markups.length) return <div>some error occured</div>;
  return (
    <div className="flex items-start gap-3">
      <div className="basis-[60%]">
        <Card full>
          <CardHead>
            <HeadingBig>{title || "Document"}</HeadingBig>
            <span className="font-bold">{documentLength} words</span>
          </CardHead>
          <div className="max-h-[70vh] overflow-auto bg-white p-4">
            <Markup
              markups={markups[summaryIndex][0]}
              markupState={markupState}
              scrollState={scrollState}
              showMarkup={showOverlap}
            />
          </div>
        </Card>
      </div>
      <div className="basis-[40%]">
        <Tabs onChange={(index) => setSummaryIndex(index)}>
          <Card full>
            <CardHead>
              <TabHead>
                {summaries.map(({ name }) => (
                  <Pill key={name}>{summarizers[name].name}</Pill>
                ))}
              </TabHead>
            </CardHead>
            <CardContent>
              <TabContent>
                {markups.map((markup, index) => (
                  <TabPanel key={index}>
                    <Summary
                      markup={markup}
                      summary={summaries[index]}
                      showMarkup={showOverlap}
                      markupState={markupState}
                      scrollState={scrollState}
                    />
                  </TabPanel>
                ))}
              </TabContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

const SummaryCompareView = ({ summaries, markups, showOverlap }) => {
  const { summarizers } = useContext(SummarizersContext);
  const elements = markups.map((markup, index) => [
    markup,
    summarizers[summaries[index].name].name,
  ]);

  return (
    <div className="flex flex-wrap gap-3">
      {elements.map(([markup, summarizer], markupIndex) => (
        <div key={markupIndex} className="grow w-full lg:w-[45%] xl:w-[30%]">
          <Card full>
            <CardHead>
              <HeadingBig>{summarizer}</HeadingBig>
            </CardHead>
            <CardContent>
              <div className="max-h-72 overflow-auto">
                <Markup markups={markup} showMarkup={showOverlap} />
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

const ToggleView = ({ showTab, toggleShowTab }) => (
  <Tooltip text="Change View">
    <CSSTransition in={showTab} timeout={300} classNames="summarizer-toggle-view">
      <Bars className="w-7 h-7" onClick={toggleShowTab} />
    </CSSTransition>
  </Tooltip>
);

const ToggleOverlap = ({ show, toggle }) => {
  const Icon = show ? EyeOpen : EyeClosed;

  return (
    <Tooltip text={"Show/Hide Agreement"}>
      <Icon className="w-7 h-7" onClick={toggle} />
    </Tooltip>
  );
};

const SummaryView = ({ title, summaries, documentLength }) => {
  const [showTab, toggleShowTab] = useReducer((e) => !e, true);
  const [showOverlap, toggleShowOverlap] = useReducer((e) => !e, false);
  const sums = useMemo(() => summaries.map(({ summaryText }) => summaryText), [summaries]);
  const originals = useMemo(() => summaries.map(({ originalText }) => originalText), [summaries]);
  const pairwiseMarkups = usePairwiseMarkups(originals, sums);
  const summaryMarkups = useMarkups(sums);
  const scrollRef = useRef();
  const tabViewKey = useRef(true);

  useMemo(() => {
    tabViewKey.current = !tabViewKey.current;
  }, [summaries]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current)
        scrollRef.current.scrollIntoView({ block: "start", behavior: "smooth", alignToTop: true });
    }, 20);
    return () => clearTimeout(timeout);
  }, [summaries]);

  return (
    <div className="scroll-mt-20" ref={scrollRef}>
      <div className="flex gap-2">
        <div>
          {showTab ? (
            <SummaryTabView
              key={tabViewKey.current}
              documentLength={documentLength}
              showOverlap={showOverlap}
              summaries={summaries}
              title={title}
              markups={pairwiseMarkups}
            />
          ) : (
            <SummaryCompareView
              showOverlap={showOverlap}
              summaries={summaries}
              markups={summaryMarkups}
            />
          )}
        </div>
        <div className="flex flex-col">
          <ToggleView showTab={showTab} toggleShowTab={toggleShowTab} />
          <ToggleOverlap show={!showOverlap} toggle={toggleShowOverlap} />
        </div>
      </div>
    </div>
  );
};

const paragraphSize = 3;
const computeParagraphs = (text) => {
  const paragraphs = [];
  for (let index = 0; index < text.length; index += paragraphSize) {
    const paragraph = text.slice(index, index + paragraphSize);
    paragraphs.push(paragraph.join(" "));
  }
  return paragraphs.join("\n\n");
};

const Summarize = () => {
  const { summarizers, loading, retry } = useContext(SummarizersContext);

  const [state, doFetch] = useAsyncFn(async (rawText, models, summaryLength) => {
    const requestText = rawText.trim();
    const ratio = parseInt(summaryLength, 10) / 100;
    const response = await summarizeRequest(requestText, models, ratio);
    const { summaries, original, url } = response;
    if (Object.values(summaries).every((summarySentences) => !summarySentences.length)) {
      throw new Error("No summaries could be generated. The input is probably too short.");
    }
    const originalText = computeParagraphs(original.text);
    const newSummaries = Object.entries(summaries).map(([name, summarySentences]) => {
      const summaryText = computeParagraphs(summarySentences);
      return {
        name,
        originalText,
        summaryText,
        url,
      };
    });
    newSummaries.sort((a, b) => a.name > b.name);
    return {
      summaries: newSummaries,
      title: original.title,
      documentLength: computeNumWords(originalText),
    };
  }, []);

  if (loading) return <CenterLoading />;
  if (!summarizers) return <Button onClick={retry}>Retry</Button>;
  return (
    <SpaceGap big>
      <div>
        <HeadingBig>Summarize Documents</HeadingBig>
        <Hint>
          You can select multiple models and customize the desired summary length. Longer documents
          are split into chunks for abstractive summarizers and the individual summaries are
          concatenated as the final summary.{" "}
        </Hint>
      </div>
      <InputDocument summarize={doFetch} state={state} />
      {!state.loading && state.value && <SummaryView {...state.value} />}
    </SpaceGap>
  );
};

export { Summarize };
