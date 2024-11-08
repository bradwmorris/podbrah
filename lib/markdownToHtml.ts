import { remark } from 'remark'
import html from 'remark-html'
import { visit } from 'unist-util-visit'
import { Node } from 'unist'

function embedVideo() {
  return (tree: Node) => {
    visit(tree, 'paragraph', (node: any) => {
      if (node.children && node.children.length === 1 && node.children[0].type === 'text') {
        const { value } = node.children[0]
        const youtubeRegex = /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&\S*)?/
        const vimeoRegex = /https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/
        
        let match = value.match(youtubeRegex)
        if (match) {
          node.type = 'html'
          node.children = undefined
          node.value = `<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
          return
        }
        
        match = value.match(vimeoRegex)
        if (match) {
          node.type = 'html'
          node.children = undefined
          node.value = `<div class="video-container"><iframe src="https://player.vimeo.com/video/${match[1]}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
          return
        }
      }
    })
  }
}

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(embedVideo)
    .use(html, { sanitize: false })
    .process(markdown)
  return result.toString()
}