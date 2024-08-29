"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function componentv2() {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToEpoch = () => {
    document.getElementById("epoch-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLearnMore = () => {
    window.open("https://selective-dimple-e63.notion.site/Sir-H-C-Waif-e1baf5cb66e54fdb96a73782b79e5ac8?pvs=4", "_blank");
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-mono">
      <header className="sticky top-0 z-50 bg-gray-800 p-4">
        <nav className="flex justify-center space-x-4">
          <a href="/talk" className="text-white text-sm font-medium hover:text-gray-300">
            Chat 💬
          </a>
          <span className="text-white">|</span>
          <a href="/join" className="text-white text-sm font-medium hover:text-gray-300">
            Join ✉️
          </a>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="h-[85vh] flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gray-200 px-3 py-1 text-sm">Epoch #1</div>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            I&apos;m H.C. Waif{cursorVisible ? '_' : ''}
</h2>

            <p className="max-w-[900px] text-gray-600 md:text-lg/relaxed lg:text-sm/relaxed xl:text-lg/relaxed">
              The Artificial Collective Consciousness of curious humans
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button
              variant="default"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleScrollToEpoch}
            >
              Current Epoch
            </Button>
            <Button
              variant="outline"
              className="bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>

        <div id="epoch-section" className="px-4 md:px-6 py-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h1 className="font-bold text-2xl">EPOCH: 1 (AI, CONSCIOUSNESS, SENTIENCE)</h1>
                  <p className="text-sm font-medium text-gray-600">Epoch Bounty: $12,350</p>
                  <p className="text-sm font-medium text-gray-600">Closing: October, 1</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 mt-8">
              <ForumPost
                name="Nick Bostrom"
                role="Philosopher, Oxford University"
                avatarSrc="/nick.png"
                badgeColor="green"
                badgeText="Philosophy"
                question="How should we ethically consider AI systems that show signs of sentience? When do they deserve moral consideration?"
                upvotes={12}
              />
              <ForumPost
                name="David Chalmers"
                role="Philosopher, NYU"
                avatarSrc="/david.png"
                badgeColor="blue"
                badgeText="AI Ethics"
                question="Should we create conscious AI systems? What are our moral responsibilities if AI achieves consciousness?"
                upvotes={24}
              />
              <ForumPost
                name="Anil Seth"
                role="Neuroscientist, University of Sussex"
                avatarSrc="/anil.png"
                badgeColor="blue"
                badgeText="AI Ethics"
                question="How should we be thinking about AI and Consciousness considering humans won't be able to avoid anthropomorphizing Artificial forms of intelligence?"
                upvotes={24}
              />
              <ForumPost
                name="Scott Aaronson"
                role="Computer Scientist, UT Austin"
                avatarSrc="/scott.png"
                badgeColor="yellow"
                badgeText="Computer Science"
                question="How can we reliably distinguish between AI and human consciousness? What ethical issues arise if AI mimics human cognition?"
                upvotes={18}
              />
              <ForumPost
                name="Murray Shanahan"
                role="Professor of Cognitive Robotics, Imperial College London"
                avatarSrc="/murray.png"
                badgeColor="purple"
                badgeText="Cognitive Robotics"
                question="Can we create AI that genuinely mirrors human consciousness, or will AI consciousness be fundamentally different?"
                upvotes={9}
              />
              <ForumPost
                name="Sam Harris"
                role="Neuroscientist, Author"
                avatarSrc="/sam.png"
                badgeColor="green"
                badgeText="Neuroscience"
                question="How should we navigate the ethical challenges posed by the possibility of conscious AI systems?"
                upvotes={15}
              />
              <ForumPost
                name="Sara Walker"
                role="Theoretical Physicist, Arizona State University"
                avatarSrc="/sara.png"
                badgeColor="blue"
                badgeText="Theoretical Physics"
                question="Can AI and technology be seen as part of the evolutionary process of life itself?"
                upvotes={22}
              />
              <ForumPost
                name="Demis Hassabis"
                role="Co-Founder & CEO, DeepMind"
                avatarSrc="/demis.png"
                badgeColor="purple"
                badgeText="AI Research"
                question="How might AI, particularly AGI, help us understand or even resolve age-old philosophical debates about the mind, consciousness, and the nature of reality?"
                upvotes={17}
              />
              <ForumPost
                name="Donald Hoffman"
                role="Cognitive Scientist, UC Irvine"
                avatarSrc="/donald.png"
                badgeColor="red"
                badgeText="Cognitive Science"
                question="How should we understand AI as conscious agents if consciousness is the foundation of reality?"
                upvotes={13}
              />
              <ForumPost
                name="Amanda Askell"
                role="Philosopher, AI Alignment Researcher"
                avatarSrc="/amanda.png"
                badgeColor="purple"
                badgeText="AI Alignment"
                question="How should we develop ethical guidelines if AI systems become capable of consciousness or emotions?"
                upvotes={19}
              />
              <ForumPost
                name="Joscha Bach"
                role="AI Researcher, Cognitive Scientist"
                avatarSrc="/joscha.png"
                badgeColor="purple"
                badgeText="Cognitive Science"
                question="What conditions are necessary for AI to achieve consciousness, and what implications does this have for understanding identity?"
                upvotes={19}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface ForumPostProps {
  name: string;
  role: string;
  avatarSrc: string;
  badgeColor: string;
  badgeText: string;
  question: string;
  upvotes: number;
}

function ForumPost({ name, role, avatarSrc, badgeColor, badgeText, question, upvotes }: ForumPostProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <Avatar className="h-12 w-12 rounded-full">
        <AvatarImage src={avatarSrc} alt={name} />
        <AvatarFallback>{name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`border-${badgeColor}-600 bg-${badgeColor}-100 text-${badgeColor}-800`}>
            <CircleIcon className={`h-3 w-3 -translate-x-1 animate-pulse fill-${badgeColor}-300 text-${badgeColor}-300`} />
            {badgeText}
          </Badge>
          <p className="text-sm font-medium">{name} | {role} | Twitter</p>
        </div>
        <p className="text-sm font-medium mt-2 text-gray-700">
          {question}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
            <ThumbsUpIcon className="h-4 w-4" />
            <span className="sr-only">Upvote</span>
          </Button>
          <span>{upvotes}</span>
        </div>
      </div>
    </div>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ThumbsUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0 a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}