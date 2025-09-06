import React from 'react';
import { CONTACT, LISTINGS } from './data';
export default function App(){return <div><h1>Sofia Rentals</h1><p>Contact: {CONTACT.name} ({CONTACT.phone})</p><ul>{LISTINGS.map(l=><li key={l.id}>{l.title} - €{l.price}</li>)}</ul></div>}
