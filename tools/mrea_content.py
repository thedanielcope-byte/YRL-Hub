# -*- coding: utf-8 -*-
"""
The Millionaire Agent Path — module content index.
Merges the two content files and preserves learning order.

Consumed by build_mrea_modules.py.

  Phase 1  Think It                  1.1 – 1.3
  Phase 2  Know Your Numbers         2.1 – 2.5
  Phase 3  Build the Machine         3.1 – 3.7
  Phase 4  Leverage & the 7th Level  4.1 – 4.3

The module ids and filenames here MUST match the PHASES registry in
portal/mrea-nav.js. If you add a module, add it in both places.
"""
from collections import OrderedDict

from mrea_content_think import MODULES as _THINK
from mrea_content_build import MODULES as _BUILD

ORDER = ["1.1", "1.2", "1.3",
         "2.1", "2.2", "2.3", "2.4", "2.5",
         "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7",
         "4.1", "4.2", "4.3"]

_ALL = {}
_ALL.update(_THINK)
_ALL.update(_BUILD)

MODULES = OrderedDict((k, _ALL[k]) for k in ORDER if k in _ALL)

missing = [k for k in ORDER if k not in _ALL]
if missing:
    raise SystemExit("mrea_content.py — missing module content for: %s" % ", ".join(missing))
