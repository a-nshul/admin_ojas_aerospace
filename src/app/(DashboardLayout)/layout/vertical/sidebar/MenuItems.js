import { uniqueId } from 'lodash';

import {
  IconUserCircle,
  IconAperture,IconNotes,IconAlertCircle,IconSettings
} from '@tabler/icons-react';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },

  // {
  //   id: uniqueId(),
  //   title: 'Dashboards',
  //   icon: IconAperture,
  //   href: '/',
  //   // chip: 'New',
  //   chipColor: 'secondary',
  // },
  // {
  //   navlabel: true,
  //   subheader: 'Apps',
  // },
  {
    id: uniqueId(),
    title:'Users management',
    icon: IconUserCircle,
    href: '/apps/chats',
  },
    {
    id: uniqueId(),
    title: 'Farmers management',
    icon: IconAperture,
    href: '/apps/notes',
  },
];
export default Menuitems;
