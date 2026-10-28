// Curated data-center reference. These are product examples, not inventory.
// Keep each entry tied to a manufacturer source; review before changing facts.
export const reviewed = '2026-10-29';
export const generations = [
  { id: 'rubin', name: 'Rubin', note: 'Vera + Rubin platforms' },
  { id: 'blackwell-ultra', name: 'Blackwell Ultra', note: 'Blackwell family refresh' },
  { id: 'blackwell', name: 'Blackwell', note: 'Compute + RTX branches' },
  { id: 'hopper', name: 'Hopper', note: 'H100 / H200 family' },
  { id: 'ada', name: 'Ada Lovelace', note: 'Graphics + inference branch' },
  { id: 'ampere', name: 'Ampere', note: 'A100 family' },
  { id: 'turing', name: 'Turing', note: 'T4 family' },
  { id: 'volta', name: 'Volta', note: 'V100 family' }
];
export const formats = [
  { id: 'pcie', name: 'PCIe cards', level: 'Accelerator', description: 'Add-in GPUs for compatible servers. Check the exact card, power, cooling and server qualification.' },
  { id: 'sxm', name: 'SXM / HGX', level: 'Module + platform', description: 'SXM is a GPU module format. HGX combines GPUs and interconnects into a platform for manufacturer systems.' },
  { id: 'superchip', name: 'CPU + GPU', level: 'Superchip', description: 'A tightly connected CPU–GPU assembly, such as Grace Hopper or Grace Blackwell, used inside a larger system.' },
  { id: 'dgx', name: 'DGX servers', level: 'Complete system', description: 'Selected NVIDIA DGX server systems. DGX also includes other product types; rack systems are shown in the next column.' },
  { id: 'rack', name: 'NVL72 racks', level: 'Rack-scale system', description: 'Integrated 72-GPU NVLink domains with compute, switching and liquid cooling. These require facility-level planning.' }
];
const sources = {
  hgx: 'https://www.nvidia.com/en-us/data-center/hgx/',
  rubin: 'https://docs.nvidia.com/dgx/dgxvr-user-guide/hardware.html',
  ultra: 'https://developer.nvidia.com/blog/inside-nvidia-blackwell-ultra-the-chip-powering-the-ai-factory-era/',
  gb300: 'https://www.nvidia.com/en-us/data-center/gb300-nvl72/',
  b300: 'https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html',
  rtx: 'https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/',
  gb200: 'https://www.nvidia.com/en-us/data-center/gb200-nvl72/',
  b200: 'https://docs.nvidia.com/dgx/dgxb200-user-guide/introduction-to-dgxb200.html',
  h100: 'https://www.nvidia.com/en-us/data-center/h100/',
  h100pcie: 'https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs22/data-center/h100/PB-11133-001_v01.pdf',
  h200: 'https://www.nvidia.com/en-us/data-center/h200/',
  gh200: 'https://www.nvidia.com/en-us/data-center/grace-hopper-superchip/',
  dgxh: 'https://docs.nvidia.com/dgx/dgxh100-user-guide/introduction-to-dgxh100.html',
  l4: 'https://www.nvidia.com/en-us/data-center/l4/',
  l40s: 'https://www.nvidia.com/en-us/data-center/l40s/',
  a100: 'https://www.nvidia.com/en-us/data-center/a100/',
  dgxa: 'https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/nvidia-dgx-a100-datasheet.pdf',
  t4: 'https://www.nvidia.com/en-us/data-center/tesla-t4/',
  v100: 'https://images.nvidia.com/content/technologies/volta/pdf/volta-v100-datasheet-update-us-1165301-r5.pdf'
};
const entry = (id, generation, format, name, summary, detail, source) => ({ id, generation, format, name, summary, detail, source: sources[source] });
export const gpuEntries = [
  entry('hgx-rubin', 'rubin', 'sxm', 'HGX Rubin NVL8', '8 × Rubin SXM GPUs', 'An HGX platform with eight Rubin GPUs. The Vera CPU configuration is named HGX Vera Rubin NVL8; x86-based CPU baseboards are another option.', 'hgx'),
  entry('vera-rubin', 'rubin', 'rack', 'Vera Rubin NVL72', '72 GPUs · liquid-cooled rack', 'The DGX Vera Rubin rack contains 18 compute trays, each with two Vera CPUs and four Rubin GPUs, plus NVLink switch trays.', 'rubin'),
  entry('hgx-b300', 'blackwell-ultra', 'sxm', 'HGX B300', '8 × Blackwell Ultra SXM GPUs', 'A multi-GPU HGX baseboard for systems built around Blackwell Ultra GPUs and NVLink 5 switches.', 'hgx'),
  entry('gb300', 'blackwell-ultra', 'superchip', 'GB300 Superchip', 'Grace + Blackwell Ultra', 'The rack-system Grace Blackwell Ultra Superchip couples one Grace CPU with two Blackwell Ultra GPUs through NVLink-C2C. The desktop variant is outside this guide.', 'ultra'),
  entry('dgx-b300', 'blackwell-ultra', 'dgx', 'DGX B300', '8 × B300 GPUs', 'An NVIDIA DGX server built around eight B300 Blackwell Ultra GPUs.', 'b300'),
  entry('gb300-nvl72', 'blackwell-ultra', 'rack', 'GB300 NVL72', '72 GPUs · 36 Grace CPUs', 'A liquid-cooled rack-scale platform integrating Blackwell Ultra GPUs, Grace CPUs and a 72-GPU NVLink domain.', 'gb300'),
  entry('rtx-pro-6000', 'blackwell', 'pcie', 'RTX PRO 6000', 'Blackwell Server Edition', 'The Server Edition is a PCIe GPU for enterprise AI and visual computing. Do not substitute the Workstation Edition or Max-Q variant when specifying a server.', 'rtx'),
  entry('hgx-b200', 'blackwell', 'sxm', 'HGX B200', '8 × Blackwell SXM GPUs', 'An HGX baseboard combining eight Blackwell GPUs with NVLink 5 switches for manufacturer server platforms.', 'hgx'),
  entry('gb200', 'blackwell', 'superchip', 'GB200 Superchip', 'Grace + Blackwell', 'One Grace CPU and two Blackwell GPUs are connected through NVLink-C2C. This assembly is a building block within a larger system.', 'gb200'),
  entry('dgx-b200', 'blackwell', 'dgx', 'DGX B200', '8 × B200 GPUs', 'An NVIDIA DGX server built around eight B200 Tensor Core GPUs.', 'b200'),
  entry('gb200-nvl72', 'blackwell', 'rack', 'GB200 NVL72', '72 GPUs · 36 Grace CPUs', 'A liquid-cooled rack-scale system combining Grace CPUs and Blackwell GPUs in a 72-GPU NVLink domain.', 'gb200'),
  entry('h100-pcie', 'hopper', 'pcie', 'H100 PCIe', 'PCIe accelerator card', 'The PCIe add-in-card variant of H100. It is distinct from H100 SXM and H100 NVL; use the exact variant in a bill of materials.', 'h100pcie'),
  entry('h100-nvl', 'hopper', 'pcie', 'H100 NVL', 'PCIe · NVLink-connected GPUs', 'H100 NVL uses PCIe cards. NVL in this product name does not mean a complete NVL72 rack.', 'h100'),
  entry('h200-nvl', 'hopper', 'pcie', 'H200 NVL', 'PCIe · NVLink bridge options', 'The PCIe variant of H200 supports two- or four-way NVLink bridges. It is distinct from H200 SXM and from a rack-scale NVL72 system.', 'h200'),
  entry('hgx-h100', 'hopper', 'sxm', 'H100 SXM / HGX H100', 'SXM GPUs · 4 / 8-GPU HGX', 'H100 SXM GPUs are used in HGX H100 partner platforms. Our featured H100 server configurations use eight SXM GPUs.', 'h100'),
  entry('hgx-h200', 'hopper', 'sxm', 'H200 SXM / HGX H200', 'SXM GPUs · 4 / 8-GPU HGX', 'H200 SXM GPUs are used in HGX H200 partner platforms. Our featured H200 server configurations use eight SXM GPUs.', 'h200'),
  entry('gh200', 'hopper', 'superchip', 'GH200 Superchip', 'Grace + Hopper', 'Grace Hopper combines a Grace CPU and a Hopper GPU through NVLink-C2C. HBM3 and HBM3e configurations exist; specify the intended variant.', 'gh200'),
  entry('dgx-h100', 'hopper', 'dgx', 'DGX H100', '8 × H100 GPUs', 'An NVIDIA DGX server with eight H100 GPUs. A manufacturer server built on HGX H100 is a different system product.', 'dgxh'),
  entry('dgx-h200', 'hopper', 'dgx', 'DGX H200', '8 × H200 GPUs', 'An NVIDIA DGX server with eight H200 GPUs. A manufacturer server built on HGX H200 is a different system product.', 'dgxh'),
  entry('l4', 'ada', 'pcie', 'L4', 'Low-profile · single-slot PCIe', 'An Ada Lovelace GPU for AI, video and visual computing in a low-profile PCIe form factor.', 'l4'),
  entry('l40s', 'ada', 'pcie', 'L40S', 'Dual-slot PCIe', 'An Ada Lovelace GPU for AI and graphics workloads. L40S uses PCIe and does not support NVLink.', 'l40s'),
  entry('a100-pcie', 'ampere', 'pcie', 'A100 PCIe', 'PCIe accelerator card', 'The PCIe form of the Ampere A100 GPU. Confirm the memory variant and server compatibility when specifying a system.', 'a100'),
  entry('hgx-a100', 'ampere', 'sxm', 'A100 SXM / HGX A100', 'SXM GPUs · 4 / 8-GPU HGX', 'The SXM form of A100 is used on HGX A100 baseboards. It is a different physical format from the PCIe card.', 'a100'),
  entry('dgx-a100', 'ampere', 'dgx', 'DGX A100', '8 × A100 GPUs', 'An NVIDIA DGX system containing eight Ampere A100 GPUs.', 'dgxa'),
  entry('t4', 'turing', 'pcie', 'T4', 'Small-form-factor PCIe', 'A Turing GPU for inference, video and graphics workloads, packaged as a 70-watt PCIe accelerator.', 't4'),
  entry('v100-pcie', 'volta', 'pcie', 'V100 / V100S PCIe', 'PCIe accelerator cards', 'Volta-generation PCIe accelerators. V100 and V100S are distinct variants; check the exact memory and card specification.', 'v100'),
  entry('v100-sxm2', 'volta', 'sxm', 'V100 SXM2', 'SXM2 GPU module', 'The SXM2 module variant of V100. It requires a compatible platform and is not interchangeable with a PCIe add-in card.', 'v100')
];
