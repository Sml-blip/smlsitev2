import ProductForm from '@/components/dashboard/forms/ProductForm'
import React from 'react'

const AddProductPage = () => {
  return (
    <div className='p-6 w-full'>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
        <p className="text-gray-500 text-sm mt-1">Remplissez le formulaire ou importez depuis un lien produit</p>
      </div>
      <ProductForm />
    </div>
  )
}

export default AddProductPage