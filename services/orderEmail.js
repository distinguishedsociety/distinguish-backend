const {sendEmail} = require('../services/emailNotification')
const Handlebars = require('handlebars')
const fs = require('fs') ;
const path = require('path') ;


const orderMailPrePaid =async  (products,order) => {
    console.log('email product', order.products)
    const updatedProduct = products && products.length > 0 ?  products.map((item) => {
        const productDetails = {productImage: item.images[0],productName: item.slug,price: (item.price * order.currRate).toFixed(2), productTitle: item.title, code: order.currCode}

        const quantity = order.products && order.products.length > 0 && order.products.filter((ord) => {
            console.log('product id',ord.product._id.toString(), item._id.toString() )
            return ord.product._id.toString() == item._id.toString()
        })
        const qty = quantity.length > 0 ? quantity[0].qty : 0
        return { productImage: productDetails.productImage,
        productName: `https://www.thedistinguishedsociety.com/products/${productDetails.productName}`, price: productDetails.price, quantity: qty, productTitle: productDetails.productTitle, code: productDetails.code}
    }) : order && order.products.length > 0 ? order.products.map((item) => {
        const productDetails = {productImage: item.product.images[0],productName: item.product.slug,price: (item.product.price * order.currRate).toFixed(2), productTitle: item.product.title, code: order.currCode}

        const quantity = order.products && order.products.length > 0 && order.products.filter((ord) => {
            console.log('product id',ord.product._id.toString(), item._id.toString() )
            return ord.product._id.toString() == item.product._id.toString()
        })
        const qty = quantity.length > 0 ? quantity[0].qty : 0
        return { productImage: productDetails.productImage,
        productName: `https://www.thedistinguishedsociety.com/products/${productDetails.productName}`, price: productDetails.price, quantity: qty, productTitle: productDetails.productTitle, code: productDetails.code}
    }) : [{productImage: '',
    productName: '', price: 0, quantity: 0, productTitle: '', code: ''}]

    const datasourceAdmin = {
        orderNumber: order._id,
        orderDate: new Date(),
        customerName: order.shippingDetails.firstName + " " + order.shippingDetails.lastName,
        customerEmail: order.shippingDetails.email,
        customerPhone: order.shippingDetails.phoneNumber,
        orderItems: [...updatedProduct],
        city: order.shippingDetails.city,
        address: order.shippingDetails.address,
        state: order.shippingDetails.state,
        country: order.shippingDetails.country,
        pincode: order.shippingDetails.pincode,
        ordStatus: order.orderStatus,
        payType: order.orderType,
        discount: (order.discountPrice * order.currRate).toFixed(2),
        couponCode: order.couponCode,
        currCode: order.currCode,
        currRate: order.currRate
    }

    let mailSubject = `New Order Received - Order Number: ${order._id}`
    const sourceFileAdmin = fs.readFileSync(
        path.join(__dirname, '../services/EmailTemplate/orderTemplate.hbs'),
        'utf8'
    );


    const template = Handlebars.compile(sourceFileAdmin);
    const htmlTemplate = template(datasourceAdmin);

    const mailObjAdmin = {
        from: 'distinguishedsocietysales@gmail.com',
        to: 'viralsangani1920@gmail.com',
        cc: ['akshay@thedistinguishedsociety.com','prasad@thedistinguishedsociety.com','admin@thedistinguishedsociety.com'],
        subject: mailSubject,
        html: htmlTemplate,
    };

    const datasourceCustomer = {
        orderNumber: order._id,
        orderDate: new Date(),
        customerName: order.shippingDetails.firstName + " " + order.shippingDetails.lastName,
        customerEmail: order.shippingDetails.email,
        customerPhone: order.shippingDetails.phoneNumber,
        orderItems: [...updatedProduct],
        customerSupportEmail: 'support@thedistinguishedsociety.com',
        customerSupportPhone: '+91-2323232222',
        discount: (order.discountPrice * order.currRate).toFixed(2),
        couponCode: order.couponCode,
        currCode: order.currCode,
        currRate: order.currRate
    }

    const sourceFileCustomer = fs.readFileSync(
        path.join(__dirname, '../services/EmailTemplate/customerNotification.hbs'),
        'utf8'
    );

    const templateCustomer = Handlebars.compile(sourceFileCustomer);
    const htmlTemplateCustomer = templateCustomer(datasourceCustomer);
    const mailObjCustomer = {
        from: 'distinguishedsocietysales@gmail.com',
        to: datasourceCustomer.customerEmail,
        cc: ['akshay@thedistinguishedsociety.com','prasad@thedistinguishedsociety.com','admin@thedistinguishedsociety.com', 'sahilakbari8460@gmail.com'],
        subject: 'Order Confirmation for Your Distinguished Society Purchase',
        html: htmlTemplateCustomer,
    };
    const response1 =await sendEmail(mailObjAdmin)
    const response2 =await sendEmail(mailObjCustomer)
    
}

const orderMailPostpaid =async  (data,order) => {
    const updatedProduct = order && order.length > 0 && order.map((item) => {
        const productDetails = {productImage: item.product.images[0],productName: item.product.title,price: (item.product.price * data.currRate).toFixed(2), code: data.currCode}

        const quantity = data.order_items && data.order_items.length > 0 && data.order_items.filter((ord) => {
           
            return ord.name == item.product.title
        })
        const qty = quantity.length > 0 ? quantity[0].units : 0
        return { productImage: productDetails.productImage,
        productName: productDetails.productName, price: productDetails.price, quantity: qty,code: productDetails.code}
    })

    const datasourceAdmin = {
        orderNumber: data.order_id,
        orderDate: new Date(),
        customerName: data.billing_customer_name + " " + data.billing_last_name,
        customerEmail: data.billing_email,
        customerPhone: data.billing_phone,
        orderItems: [...updatedProduct],
        city: data.shipping_city,
        address: data.shipping_address,
        state: data.shipping_state,
        country: data.shipping_country,
        pincode: data.shipping_pincode,
        ordStatus: 'Placed',
        payType: data.payment_method,
        discount: (data.total_discount * data.currRate).toFixed(2),
        couponCode: data.couponCode,
        currCode: data.currCode,
        currRate: data.currRate
    }

    let mailSubject = `New Order Received - Order Number: ${data.order_id}`
    const sourceFileAdmin = fs.readFileSync(
        path.join(__dirname, '../services/EmailTemplate/orderTemplate.hbs'),
        'utf8'
    );  


    const template = Handlebars.compile(sourceFileAdmin);
    const htmlTemplate = template(datasourceAdmin);

    const mailObjAdmin = {
        from: 'viralsangani1920@gmail.com',
        to: 'viralsangani3333@gmail.com',
        cc: ['akshay@thedistinguishedsociety.com','prasad@thedistinguishedsociety.com','admin@thedistinguishedsociety.com'],
        subject: mailSubject,
        html: htmlTemplate,
    };

    const datasourceCustomer = {
        orderNumber: data.order_id,
        orderDate: new Date(),
        orderItems: [...updatedProduct],
        customerName: data.billing_customer_name + " " + data.billing_last_name,
        customerEmail: data.billing_email,
        customerPhone: data.billing_phone,
        customerSupportEmail: 'support@thedistinguishedsociety.com',
        customerSupportPhone: '+91-2323232222',
        couponCode: data.couponCode,
        discount: (data.total_discount * data.currRate).toFixed(2),
        currCode: data.currCode,
        currRate: data.currRate
    }

    const sourceFileCustomer = fs.readFileSync(
        path.join(__dirname, '../services/EmailTemplate/customerNotification.hbs'),
        'utf8'
    );

    const templateCustomer = Handlebars.compile(sourceFileCustomer);
    const htmlTemplateCustomer = templateCustomer(datasourceCustomer);
    const mailObjCustomer = {
        from: 'viralsangani1920@gmail.com',
        to: datasourceCustomer.customerEmail,
        subject: 'Order Confirmation for Your Distinguished Society Purchase',
        html: htmlTemplateCustomer,
    };
    const response1 =await sendEmail(mailObjAdmin)
    const response2 =await sendEmail(mailObjCustomer)

}
module.exports = { orderMailPostpaid, orderMailPrePaid }
