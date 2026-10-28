// Manufacturer specifications, checked 2026-10-29. These are platform options,
// not a statement of stock, pricing, reseller authorization, or final configuration.
export const products = [
  {
    id: 'supermicro-sys-821ge-tnhr', brand: 'Supermicro', model: 'SYS-821GE-TNHR',
    image: 'images/products/supermicro-sys-821ge-tnhr.jpg', rack: '8U',
    description: 'An eight-GPU HGX platform with flexible expansion for demanding AI and HPC workloads.',
    cpu: 'Dual 4th / 5th Gen Intel Xeon Scalable', memory: '32 DDR5 DIMM slots',
    cooling: 'Air cooled', interconnect: 'NVIDIA NVLink + NVSwitch',
    storage: '12 front NVMe bays as standard; additional drive options depend on configuration.',
    detail: 'Up to 8 TB system memory with supported DIMMs. PCIe Gen 5 expansion for networking and storage.',
    source: 'https://www.supermicro.com/en/products/system/gpu/8u/sys-821ge-tnhr',
    imageSource: 'https://www.broadberry.co.uk/system_files/images/system_images/cut/SYS-821GE-TNHR.jpg'
  },
  {
    id: 'dell-poweredge-xe9680', brand: 'Dell', model: 'PowerEdge XE9680',
    image: 'images/products/dell-poweredge-xe9680.webp', rack: '6U',
    description: 'A dense eight-GPU platform with Dell management tools for enterprise AI infrastructure.',
    cpu: 'Dual 4th / 5th Gen Intel Xeon Scalable', memory: '32 DDR5 DIMM slots',
    cooling: 'Air cooled', interconnect: 'NVIDIA NVLink',
    storage: 'NVMe storage configurations and optional BOSS-N1 mirrored boot drives.',
    detail: 'Up to 4 TB system memory. iDRAC9 and OpenManage support system management and lifecycle operations.',
    source: 'https://www.delltechnologies.com/asset/en-uk/products/servers/technical-support/poweredge-xe9680-spec-sheet.pdf',
    imageSource: 'https://www.logixer.com/web/image/56479-fac360e7/server-poweredge-xe9680-black-gallery-2.webp'
  },
  {
    id: 'hpe-cray-xd670', brand: 'HPE', model: 'Cray XD670',
    image: 'images/products/hpe-cray-xd670.png', rack: '5U',
    description: 'An eight-GPU system for AI training and HPC, with air or direct liquid cooling configurations.',
    cpu: '4th Gen Intel Xeon for H100; 5th Gen for H200', memory: '32 DDR5 DIMM slots',
    cooling: 'Air / direct liquid options', interconnect: 'NVIDIA NVLink',
    storage: 'Up to 8 SFF NVMe drives and 2 M.2 boot drives, depending on configuration.',
    detail: 'Eight SXM5 GPUs in a 5U chassis. CPU generation and cooling components are selected with the GPU configuration.',
    source: 'https://www.hpe.com/psnow/doc/a50004292enw',
    imageSource: 'https://assets.ext.hpe.com/is/image/hpedam/s00011989?bfc=off&fit=fit&fmt=png-alpha&hei=600&s00011989.png=&wid=800'
  }
];

export const gpuSpecs = {
  H100: { name: 'H100 SXM', memory: '80 GB', type: 'HBM3', bandwidth: '3.35 TB/s', total: '640 GB' },
  H200: { name: 'H200 SXM', memory: '141 GB', type: 'HBM3e', bandwidth: '4.8 TB/s', total: '1,128 GB' }
};

export const contact = {
  email: 'cindy@ateamdata.com', phone: '+1 503 754 3678', phoneHref: '+15037543678',
  address: '520 SW Yamhill St, Portland, OR 97204, USA'
};
