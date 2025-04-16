import React from 'react'


const products = [
    {
      id: 1,
      name: 'Croissant',
      href: '#',
      imageSrc: 'https://sarahsvegankitchen.com/wp-content/uploads/2024/05/Vegan-Croissants-1.jpg',
      imageAlt: "A delicious croissant.",
      price: '$3',
    },
    {
      id: 2,
      name: 'Bagel',
      href: '#',
      imageSrc: 'https://www.justspices.co.uk/media/recipe/resized/510x510/recipe/Avocado_Topping_Avocado_Bagel-3.jpg',
      imageAlt: "A freshly baked bagel.",
      price: '$2.50',
    },
    {
      id: 3,
      name: 'Muffin',
      href: '#',
      imageSrc: 'https://bakerbynature.com/wp-content/uploads/2011/05/Blueberry-Muffins-1-of-1.jpg',
      imageAlt: "A blueberry muffin.",
      price: '$2.75',
    },
    {
      id: 4,
      name: 'Sandwich',
      href: '#',
      imageSrc: 'https://natashaskitchen.com/wp-content/uploads/2021/08/Grilled-Cheese-Sandwich-SQ.jpg',
      imageAlt: "A club sandwich.",
      price: '$5',
    },
    {
      id: 5,
      name: 'Pizza Slice',
      href: '#',
      imageSrc: 'https://ooni.com/cdn/shop/articles/pepperoni-pizza_27477125-507f-4948-ac59-824ac0581df5.jpg?crop=center&height=800&v=1737104605&width=800',
      imageAlt: "A slice of pepperoni pizza.",
      price: '$4',
    },
    {
      id: 6,
      name: 'Donut',
      href: '#',
      imageSrc: 'https://thefirstyearblog.com/wp-content/uploads/2020/10/chocolate-donuts-Square2.png',
      imageAlt: "A glazed donut.",
      price: '$1.50',
    },
    {
      id: 7,
      name: 'Cupcake',
      href: '#',
      imageSrc: 'https://cdn.bakedbyrachel.com/wp-content/uploads/2018/01/chocolatecupcakesccfrosting_bakedbyrachel-2.jpg',
      imageAlt: "A chocolate cupcake with frosting.",
      price: '$2.25',
    },
    {
      id: 8,
      name: 'Pasta',
      href: '#',
      imageSrc: 'https://alittleandalot.com/wp-content/uploads/2024/01/1200-creamy-mushroom-pasta-1-s-735x735.jpg',
      imageAlt: "A plate of creamy pasta.",
      price: '$6',
    },
  ]

const Products = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-start">Top picks</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
              />
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={product.href}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-900">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Products
