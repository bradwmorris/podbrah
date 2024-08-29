"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function componentv2() {
  const handleScrollToEpoch = () => {
    document.getElementById("epoch-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLearnMore = () => {
    window.open("https://selective-dimple-e63.notion.site/Sir-H-C-Waif-e1baf5cb66e54fdb96a73782b79e5ac8?pvs=4", "_blank");
  };

  return (
    <div>
     {/* Styled Navigation Bar with Off-Black Background and White Text */}
  <header style={{ backgroundColor: "#1a1a1a", color: "white", padding: "8px" }} className="sticky top-0 z-50">
    <nav className="flex justify-center">
      <a href="/talk" style={{ color: "white", fontSize: "0.875rem", fontWeight: "500" }}>
        Speak with H.C. Waif 👉
      </a>
    </nav>
  </header>

      <main className="flex-1 overflow-y-auto">
        {/* Main Banner */}
        <div className="h-[85vh] flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6 py-12 md:py-24 lg:py-32">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Epoch #1</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Hi. I'm Sir H.C. Waif</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-lg/relaxed lg:text-sm/relaxed xl:text-lg/relaxed">
              The Artificial Collective Consciousness of curious humans
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button
              variant="default"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              onClick={handleScrollToEpoch}
            >
              Current Epoch
            </Button>
            <Button
              variant="outline"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              onClick={handleLearnMore}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Forum Section */}
        <div id="epoch-section" className="px-4 md:px-6 py-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold">EPOCH: 1</h2>
                  <p className="text-sm font-medium">Epoch Bounty: $12,350</p>
                  <p className="text-sm font-medium">Closing: October, 1</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/vitalik.png" alt="Vitalik Buterin" />
                  <AvatarFallback>VB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                      Technology
                    </Badge>
                    <p className="text-sm font-medium">Vitalik Buterin</p>
                  </div>
                  <p className="text-sm font-medium">Which technologies favour defensive tech?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>12</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="David Chalmers" />
                  <AvatarFallback>DC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-blue-300 text-blue-300" />
                      AI Ethics
                    </Badge>
                    <p className="text-sm font-medium">David Chalmers</p>
                  </div>
                  <p className="text-sm font-medium">How should we approach consciousness in Artificial Intelligence?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>24</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Elon Musk" />
                  <AvatarFallback>EM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-yellow-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-yellow-300 text-yellow-300" />
                      Freedom of Speech
                    </Badge>
                    <p className="text-sm font-medium">Elon Musk</p>
                  </div>
                  <p className="text-sm font-medium">How can AI help preserve freedom of speech?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>18</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 1" />
                  <AvatarFallback>PU1</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-purple-300 text-purple-300" />
                      Healthcare
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 1</p>
                  </div>
                  <p className="text-sm font-medium">What is the future of AI in healthcare?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>9</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 2" />
                  <AvatarFallback>PU2</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-green-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-green-300 text-green-300" />
                      Climate Change
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 2</p>
                  </div>
                  <p className="text-sm font-medium">How can AI be used to combat climate change?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>15</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 3" />
                  <AvatarFallback>PU3</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-blue-300 text-blue-300" />
                      AI Ethics
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 3</p>
                  </div>
                  <p className="text-sm font-medium">What are the ethical considerations in AI development?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>22</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 4" />
                  <AvatarFallback>PU4</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-purple-300 text-purple-300" />
                      Education
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 4</p>
                  </div>
                  <p className="text-sm font-medium">How can AI be used to improve education?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>17</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 5" />
                  <AvatarFallback>PU5</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-red-300 text-red-300" />
                      AI Risks
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 5</p>
                  </div>
                  <p className="text-sm font-medium">What are the potential risks of advanced AI systems?</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>13</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12 rounded-full">
                  <AvatarImage src="/placeholder-user.jpg" alt="Placeholder User 6" />
                  <AvatarFallback>PU6</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-600 bg-background">
                      <CircleIcon className="h-3 w-3 -translate-x-1 animate-pulse fill-purple-300 text-purple-300" />
                      Accessibility
                    </Badge>
                    <p className="text-sm font-medium">Placeholder User 6</p>
                  </div>
                  <p className="text-sm font-medium">
                    How can AI be used to improve accessibility for people with disabilities?
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button variant="ghost" size="icon">
                      <ThumbsUpIcon className="h-4 w-4" />
                      <span className="sr-only">Upvote</span>
                    </Button>
                    <span>19</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
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
