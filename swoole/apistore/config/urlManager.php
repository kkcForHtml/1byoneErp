<?php

return [
    'enablePrettyUrl' => true,
    'enableStrictParsing' => false,
    'showScriptName' => false,
    'suffix' => '',
    'rules' => [
        '<controller:\w+>/<action:(view|update|delete)>/<id:\w+>' => '<controller>/<action>',
        '<controller:\w+>/<action:(index)>/<page:\w+>' => '<controller>/<action>',
        '<controller:\w+>/<action:\w+>' => '<controller>/<action>',
    ],
];
