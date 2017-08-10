<?php

return [
    'sqlcache' => [
        'class' => 'yii\swoole\sqlcache\Module',
        'is_debug' => false
    ],
    'common' => [
        'class' => 'addons\common\Module',
        'modules' => [
            'file' => [
                'class' => 'addons\common\file\Module',
                'is_debug' => false
            ],
            'base' => [
                'class' => 'addons\common\base\Module',
                'is_debug' => true
            ]
        ]
    ],
    'organization' => [
        'class' => 'addons\organization\Module',
        'is_debug' => true
    ],
    'journal' => [
        'class' => 'addons\journal\Module',
        'is_debug' => true
    ],
    'master' => [
        'class' => 'addons\master\Module',
        'modules' => [
            'basics' => [
                'class' => 'addons\master\basics\Module',
                'is_debug' => true
            ],
            'partint' => [
                'class' => 'addons\master\partint\Module',
                'is_debug' => true
            ],
            'product' => [
                'class' => 'addons\master\product\Module',
                'is_debug' => true
            ]
        ]
    ],
    'users' => [
        'class' => 'addons\users\Module',
        'is_debug' => true
    ],
    'tools' => [
        'class' => 'addons\tools\Module',
    ],
    'inventory' => [
        'class' => 'addons\inventory\Module',
        'is_debug' => true
    ],
    'purchase' => [
        'class' => 'addons\purchase\Module',
        'is_debug' => true
    ],
    'sales' => [
        'class' => 'addons\sales\Module',
        'is_debug' => true
    ],
    'finance' => [
        'class' => 'addons\finance\Module',
        'is_debug' => true
    ],
    'shipment' => [
        'class' => 'addons\shipment\Module',
        'is_debug' => true
    ],
    'report' => [
        'class' => 'addons\report\Module',
        'is_debug' => true
    ],
    'amazon' => [
        'class' => 'addons\amazon\Module',
        'is_debug' => true
    ],
    'indexpage' => [
        'class' => 'addons\indexpage\Module',
        'is_debug' => true
    ],
];
