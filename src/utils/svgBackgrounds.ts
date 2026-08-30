export interface SvgPreset {
  id: string;
  name: string;
  url: string;
}

const encodeSvg = (svgStr: string) => {
  const base64 = typeof window !== 'undefined' ? btoa(svgStr) : Buffer.from(svgStr).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

export const SVG_BACKGROUND_PRESETS: SvgPreset[] = [
  { 
    id: 'none', 
    name: 'None (Solid Color)', 
    url: '' 
  },
  { 
    id: 'symbol-scatter', 
    name: 'Symbol Scatter', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect x="0" y="0" width="900" height="600" fill="#001829"></rect><g fill="#297EA6"><path d="M0 -111.4L25 -34.4L105.9 -34.4L40.5 13.1L65.5 90.1L0 42.5L-65.5 90.1L-40.5 13.1L-105.9 -34.4L-25 -34.4Z" transform="translate(345 455)"></path><path d="M0 -49.1L11 -15.2L46.7 -15.2L17.8 5.8L28.8 39.7L0 18.7L-28.8 39.7L-17.8 5.8L-46.7 -15.2L-11 -15.2Z" transform="translate(791 76)"></path><path d="M0 -77.4L17.4 -23.9L73.6 -23.9L28.1 9.1L45.5 62.6L0 29.6L-45.5 62.6L-28.1 9.1L-73.6 -23.9L-17.4 -23.9Z" transform="translate(171 145)"></path><path d="M0 -105.7L23.7 -32.7L100.5 -32.7L38.4 12.5L62.1 85.5L0 40.4L-62.1 85.5L-38.4 12.5L-100.5 -32.7L-23.7 -32.7Z" transform="translate(586 471)"></path></g></svg>') 
  },
  { 
    id: 'blob-scatter', 
    name: 'Blob Scatter', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect width="900" height="600" fill="#931F1F"></rect><g><g transform="translate(154 75)"><path d="M91.7 -29.3C105.6 13.1 94.6 64.1 60.9 90.1C27.2 116 -29.3 117 -64 91.1C-98.7 65.1 -111.7 12.3 -97.4 -30.6C-83.1 -73.5 -41.6 -106.5 -1.3 -106.1C38.9 -105.7 77.7 -71.8 91.7 -29.3Z" stroke="#F7760E" fill="none" stroke-width="20"></path></g><g transform="translate(138 402)"><path d="M79.5 -28C89.4 4.6 74.4 43.2 46.7 63C19 82.9 -21.4 84 -46.4 65.5C-71.3 46.9 -80.8 8.8 -70.5 -24.4C-60.2 -57.7 -30.1 -86 2.3 -86.7C34.8 -87.5 69.6 -60.7 79.5 -28Z" stroke="#F7760E" fill="none" stroke-width="20"></path></g><g transform="translate(622 13)"><path d="M94.6 -30.9C105.4 2.5 85.1 45.9 53.2 67.9C21.2 89.9 -22.5 90.5 -52.6 69.3C-82.7 48.2 -99.2 5.3 -88.2 -28.4C-77.1 -62.1 -38.6 -86.6 1.7 -87.1C41.9 -87.7 83.8 -64.2 94.6 -30.9Z" stroke="#F7760E" fill="none" stroke-width="20"></path></g><g transform="translate(508 408)"><path d="M86.6 -30.7C98.9 9.8 86.5 55.9 55.1 79.5C23.7 103.2 -26.6 104.6 -59.4 80.9C-92.2 57.3 -107.5 8.7 -94.7 -32.6C-81.9 -73.8 -40.9 -107.7 -1.9 -107.1C37.1 -106.5 74.2 -71.3 86.6 -30.7Z" stroke="#F7760E" fill="none" stroke-width="20"></path></g><g transform="translate(806 591)"><path d="M66.2 -17.5C76.9 11.5 70.7 50.1 46 69.4C21.4 88.8 -21.6 88.9 -48.5 68.9C-75.4 48.8 -86.1 8.7 -75.3 -20.4C-64.6 -49.5 -32.3 -67.5 -2.3 -66.8C27.7 -66 55.5 -46.5 66.2 -17.5Z" stroke="#F7760E" fill="none" stroke-width="20"></path></g></g></svg>') 
  },
  { 
    id: 'circle-scatter', 
    name: 'Circle Scatter', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect x="0" y="0" width="900" height="600" fill="#001220"></rect><g fill="#A7233A"><circle r="147" cx="514" cy="537"></circle><circle r="65" cx="426" cy="218"></circle><circle r="97" cx="54" cy="271"></circle><circle r="138" cx="720" cy="87"></circle><circle r="109" cx="820" cy="425"></circle></g></svg>') 
  },
  { 
    id: 'blob-scene', 
    name: 'Blob Scene', 
    url: encodeSvg('<svg viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="900" height="600" fill="#001220"></rect><g transform="translate(900, 0)"><path d="M0 520C-80 500 -160 470 -240 430C-320 390 -400 340 -440 280C-480 220 -470 140 -490 70C-510 0 -560 -70 -600 -140L0 -140Z" fill="#FBAE3C"></path></g><g transform="translate(0, 600)"><path d="M0 -520C80 -500 160 -470 240 -430C320 -390 400 -340 440 -280C480 -220 470 -140 490 -70C510 0 560 70 600 140L0 140Z" fill="#FBAE3C"></path></g></svg>') 
  },
  { 
    id: 'low-poly-grid', 
    name: 'Low Poly Grid', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><g stroke-width="1" stroke-linejoin="bevel"><path d="M472 290L526 228L408 217Z" fill="#081a28" stroke="#081a28"></path><path d="M408 217L376 275L472 290Z" fill="#19435d" stroke="#19435d"></path><path d="M526 228L476 85L408 217Z" fill="#277297" stroke="#277297"></path><path d="M408 217L277 215L376 275Z" fill="#0c2435" stroke="#0c2435"></path><path d="M376 275L411 367L472 290Z" fill="#205a7a" stroke="#205a7a"></path><path d="M626 320L624 227L526 228Z" fill="#112e42" stroke="#112e42"></path><path d="M476 85L411 86L408 217Z" fill="#1d4e6b" stroke="#1d4e6b"></path><path d="M626 320L526 228L472 290Z" fill="#15384f" stroke="#15384f"></path><path d="M526 228L577 103L476 85Z" fill="#297ea6" stroke="#297ea6"></path><path d="M624 227L577 103L526 228Z" fill="#297ea6" stroke="#297ea6"></path><path d="M537 425L626 320L472 290Z" fill="#00101c" stroke="#00101c"></path><path d="M312 79L277 215L408 217Z" fill="#0c2435" stroke="#0c2435"></path><path d="M376 275L274 325L411 367Z" fill="#112e42" stroke="#112e42"></path><path d="M411 367L537 425L472 290Z" fill="#19435d" stroke="#19435d"></path><path d="M277 215L274 325L376 275Z" fill="#0c2435" stroke="#0c2435"></path><path d="M411 367L513 499L537 425Z" fill="#00101c" stroke="#00101c"></path><path d="M366 0L312 79L411 86Z" fill="#00101c" stroke="#00101c"></path><path d="M411 86L312 79L408 217Z" fill="#0c2435" stroke="#0c2435"></path><path d="M537 425L609 408L626 320Z" fill="#15384f" stroke="#15384f"></path><path d="M596 0L463 0L476 85Z" fill="#246688" stroke="#246688"></path><path d="M476 85L463 0L411 86Z" fill="#205a7a" stroke="#205a7a"></path><path d="M737 289L696 186L624 227Z" fill="#0c2435" stroke="#0c2435"></path><path d="M624 227L696 186L577 103Z" fill="#112e42" stroke="#112e42"></path><path d="M577 103L596 0L476 85Z" fill="#0c2435" stroke="#0c2435"></path><path d="M737 289L624 227L626 320Z" fill="#277297" stroke="#277297"></path></g></svg>') 
  },
  { 
    id: 'stacked-waves', 
    name: 'Stacked Waves', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M0 67L13.7 89C27.3 111 54.7 155 82 161C109.3 167 136.7 135 163.8 134C191 133 218 163 245.2 183C272.3 203 299.7 213 327 217C354.3 221 381.7 219 409 214C436.3 209 463.7 201 491 191C518.3 181 545.7 169 573 170C600.3 171 627.7 185 654.8 176C682 167 709 135 736.2 131C763.3 127 790.7 151 818 167C845.3 183 872.7 191 886.3 195L900 199L900 0L886.3 0C872.7 0 845.3 0 818 0C790.7 0 763.3 0 736.2 0C709 0 682 0 654.8 0C627.7 0 600.3 0 573 0C545.7 0 518.3 0 491 0C463.7 0 436.3 0 409 0C381.7 0 354.3 0 327 0C299.7 0 272.3 0 245.2 0C218 0 191 0 163.8 0C136.7 0 109.3 0 82 0C54.7 0 27.3 0 13.7 0L0 0Z" fill="#6198ff"></path><path d="M0 169L13.7 182C27.3 195 54.7 221 82 217C109.3 213 136.7 179 163.8 178C191 177 218 209 245.2 242C272.3 275 299.7 309 327 322C354.3 335 381.7 327 409 319C436.3 311 463.7 303 491 285C518.3 267 545.7 239 573 235C600.3 231 627.7 251 654.8 247C682 243 709 215 736.2 215C763.3 215 790.7 243 818 256C845.3 269 872.7 267 886.3 266L900 265L900 197L886.3 193C872.7 189 845.3 181 818 165C790.7 149 763.3 125 736.2 129C709 133 682 165 654.8 174C627.7 183 600.3 169 573 168C545.7 167 518.3 179 491 189C463.7 199 436.3 207 409 212C381.7 217 354.3 219 327 215C299.7 211 272.3 201 245.2 181C218 161 191 131 163.8 132C136.7 133 109.3 165 82 159C54.7 153 27.3 109 13.7 87L0 65Z" fill="#3c80ff"></path><path d="M0 379L13.7 396C27.3 413 54.7 447 82 441C109.3 435 136.7 389 163.8 369C191 349 218 355 245.2 374C272.3 393 299.7 425 327 433C354.3 441 381.7 425 409 429C436.3 433 463.7 457 491 450C518.3 443 545.7 405 573 386C600.3 367 627.7 367 654.8 379C682 391 709 415 736.2 418C763.3 421 790.7 403 818 414C845.3 425 872.7 465 886.3 485L900 505L900 263L886.3 264C872.7 265 845.3 267 818 254C790.7 241 763.3 213 736.2 213C709 213 682 241 654.8 245C627.7 249 600.3 229 573 233C545.7 237 518.3 265 491 283C463.7 301 436.3 309 409 317C381.7 325 354.3 333 327 320C299.7 307 272.3 273 245.2 240C218 207 191 175 163.8 176C136.7 177 109.3 211 82 215C54.7 219 27.3 193 13.7 180L0 167Z" fill="#0066ff"></path></svg>') 
  },
  { 
    id: 'stacked-peaks', 
    name: 'Stacked Peaks', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M728 600L827 550L782 500L746 450L800 400L764 350L800 300L746 250L746 200L800 150L746 100L773 50L800 0L900 0L900 600Z" fill="#059669"></path><path d="M656 600L674 550L656 500L692 450L737 400L638 350L683 300L665 250L620 200L719 150L629 100L701 50L656 0L801 0L729 600Z" fill="#10b981"></path><path d="M476 600L440 550L575 500L593 450L575 400L557 350L584 300L467 250L467 200L557 150L422 100L512 50L575 0L657 0L657 600Z" fill="#34d399"></path></svg>') 
  },
  { 
    id: 'blob-haikei', 
    name: 'Blob Haikei', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect x="0" y="0" width="900" height="600" fill="#FF0066"></rect><g transform="translate(454.0077953740364 285.0158555181855)"><path d="M110 -112.9C149.4 -70.7 192.7 -35.4 210.4 17.7C228 70.7 220.1 141.4 180.8 190.3C141.4 239.1 70.7 266 10.5 255.6C-49.7 245.1 -99.5 197.1 -140.6 148.3C-181.8 99.5 -214.4 49.7 -224.2 -9.8C-234 -69.3 -220.9 -138.6 -179.8 -180.8C-138.6 -222.9 -69.3 -238 -17 -221C35.4 -204 70.7 -155 110 -112.9" fill="#BB004B"></path></g></svg>') 
  },
  { 
    id: 'layered-peaks', 
    name: 'Layered Peaks', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><rect x="0" y="0" width="900" height="600" fill="#931C1C"></rect><path d="M0 418L129 431L257 430L386 389L514 407L643 364L771 352L900 412L900 601L771 601L643 601L514 601L386 601L257 601L129 601L0 601Z" fill="#f5730a"></path><path d="M0 405L129 395L257 411L386 445L514 437L643 421L771 471L900 479L900 601L771 601L643 601L514 601L386 601L257 601L129 601L0 601Z" fill="#da5b09"></path><path d="M0 502L129 506L257 439L386 467L514 446L643 462L771 505L900 505L900 601L771 601L643 601L514 601L386 601L257 601L129 601L0 601Z" fill="#be4407"></path><path d="M0 525L129 533L257 492L386 481L514 518L643 525L771 491L900 533L900 601L771 601L643 601L514 601L386 601L257 601L129 601L0 601Z" fill="#a32d04"></path><path d="M0 554L129 570L257 561L386 560L514 532L643 558L771 569L900 555L900 601L771 601L643 601L514 601L386 601L257 601L129 601L0 601Z" fill="#871400"></path></svg>') 
  },
  { 
    id: 'stacked-steps', 
    name: 'Stacked Steps', 
    url: encodeSvg('<svg id="visual" viewBox="0 0 900 600" width="900" height="600" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"><path d="M0 55L82 55L82 103L164 103L164 73L245 73L245 91L327 91L327 85L409 85L409 79L491 79L491 67L573 67L573 43L655 43L655 85L736 85L736 91L818 91L818 49L900 49L900 0L900 0L818 0L818 0L736 0L736 0L655 0L655 0L573 0L573 0L491 0L491 0L409 0L409 0L327 0L327 0L245 0L245 0L164 0L164 0L82 0L82 0L0 0Z" fill="#b0235f"></path><path d="M0 115L82 115L82 235L164 235L164 151L245 151L245 151L327 151L327 205L409 205L409 199L491 199L491 211L573 211L573 139L655 139L655 205L736 205L736 163L818 163L818 133L900 133L900 157L900 41L900 47L818 47L818 89L736 89L736 83L655 83L655 41L573 41L573 65L491 65L491 77L409 77L409 83L327 83L327 89L245 89L245 71L164 71L164 101L82 101L82 53L0 53Z" fill="#c53762"></path><path d="M0 367L82 367L82 313L164 313L164 271L245 271L245 379L327 379L327 325L409 325L409 337L491 337L491 373L573 373L573 373L655 373L655 337L736 337L736 289L818 289L818 295L900 295L900 391L900 155L900 131L818 131L818 161L736 161L736 203L655 203L655 137L573 137L573 209L491 209L491 197L409 197L409 203L327 203L327 149L245 149L245 149L164 149L164 233L82 233L82 113L0 113Z" fill="#d84a64"></path><path d="M0 421L82 421L82 409L164 409L164 331L245 331L245 433L327 433L327 433L409 433L409 457L491 457L491 433L573 433L573 463L655 463L655 433L736 433L736 355L818 355L818 403L900 403L900 505L900 389L900 293L818 293L818 287L736 287L736 335L655 335L655 371L573 371L573 371L491 371L491 335L409 335L409 323L327 323L327 377L245 377L245 269L164 269L164 311L82 311L82 365L0 365Z" fill="#ea5e66"></path><path d="M0 601L82 601L82 601L164 601L164 601L245 601L245 601L327 601L327 601L409 601L409 601L491 601L491 601L573 601L573 601L655 601L655 601L736 601L736 601L818 601L818 601L900 601L900 601L900 503L900 401L818 401L818 353L736 353L736 431L655 431L655 461L573 461L573 431L491 431L491 455L409 455L409 431L327 431L327 431L245 431L245 329L164 329L164 407L82 407L82 419L0 419Z" fill="#fa7268"></path></svg>') 
  },
];
