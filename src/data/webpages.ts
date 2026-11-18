export type Webpage = {
  id: number
  url: string
  title: string
  text: string
  links: number[]
}

export const webpages: Webpage[] = [
  { id: 1, url: 'pune-food-guide.com', title: 'Pune Food Guide', text: 'Where to eat in Pune - vada pav and biryani and pizza', links: [2] },
  { id: 2, url: 'best-pizza-pune.com', title: 'Best Pizza Pune', text: 'Fresh wood-fired pizza made daily - try our cheese pizza', links: [1, 3] },
  { id: 3, url: 'college-canteen-blog.com', title: 'College Canteen Blog', text: 'Student reviews of canteen food and chai and Friday pizza', links: [2, 4] },
  { id: 4, url: 'pizza-recipes-home.com', title: 'Pizza Recipes Home', text: 'Make pizza at home - pizza dough and pizza sauce', links: [2, 5] },
  { id: 5, url: 'cheap-eats-pune.com', title: 'Cheap Eats Pune', text: 'Good food under 100 rupees - misal and dosa and pizza slices', links: [2] },
  { id: 6, url: 'pizza-pizza-pizza.com', title: 'Pizza Pizza Pizza', text: 'pizza pizza pizza pizza pizza pizza pizza pizza pizza pizza', links: [1] },
]
